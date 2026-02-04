<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with(['category', 'images'])->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'sku' => 'required|unique:products,sku',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'stock_current' => 'required|integer'
        ]);
        $product = Product::create([
            'sku' => $request->sku,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'description' => $request->description,
            'price' => $request->price,
            'cost_price' => $request->cost_price,
            'stock_current' => $request->stock_current,
            'category_id' => $request->category_id,
            'is_visible' => $request->boolean('is_visible', true),
        ]);
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => '/storage/' . $path,
                    'is_cover' => $index === 0,
                    'position' => $index
                ]);
            }
        }

        return response()->json($product->load('images'), 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
        $data = $request->except(['images', '_method']);
        if ($request->has('is_visible')) {
            $data['is_visible'] = filter_var($request->is_visible, FILTER_VALIDATE_BOOLEAN);
        }
        $product->update($data);
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => '/storage/' . $path,
                    'is_cover' => !$product->images()->where('is_cover', true)->exists(),
                    'position' => 0
                ]);
            }
        }

        return response()->json($product->load('images'));
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if ($product) {
            $product->delete();
            return response()->json(['message' => 'Producto eliminado']);
        }
        return response()->json(['message' => 'No encontrado'], 404);
    }

    public function destroyImage($id)
    {
        $image = ProductImage::find($id);
        if (!$image)
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        $relativePath = str_replace('/storage/', '', $image->url);
        Storage::disk('public')->delete($relativePath);
        $image->delete();

        return response()->json(['message' => 'Imagen eliminada']);
    }

    public function setCover($imageId)
    {
        $image = ProductImage::find($imageId);
        if (!$image)
            return response()->json(['message' => 'Imagen no encontrada'], 404);
        ProductImage::where('product_id', $image->product_id)->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);

        return response()->json(['message' => 'Portada actualizada']);
    }

    public function indexPublic()
    {
        $products = Product::with(['images', 'category'])
            ->where('is_visible', true)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($products);
    }
}