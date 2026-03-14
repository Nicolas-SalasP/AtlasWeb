<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function indexPublic()
    {
        return Service::where('is_active', true)->get();
    }

    public function index()
    {
        return Service::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'price' => 'required|integer',
            'duration_days' => 'required|integer',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
            'features' => 'nullable'
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('services', $filename, 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        if ($request->has('features')) {
            $data['features'] = is_array($request->features) ? $request->features : json_decode($request->features, true);
        }

        $service = Service::create($data);
        return response()->json($service, 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        $data = $request->validate([
            'name' => 'nullable|string',
            'price' => 'nullable|integer',
            'duration_days' => 'nullable|integer',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'features' => 'nullable'
        ]);

        if ($request->hasFile('image')) {
            if ($service->image_url) {
                $oldPath = str_replace('/storage/', '', $service->image_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('image');
            $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('services', $filename, 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        if ($request->has('features')) {
            $data['features'] = is_array($request->features) ? $request->features : json_decode($request->features, true);
        }

        $service->update($data);
        return response()->json($service);
    }

    public function destroy($id)
    {
        $service = Service::find($id);
        
        if ($service) {
            if ($service->image_url) {
                $relativePath = str_replace('/storage/', '', $service->image_url);
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
            
            $service->delete();
            return response()->json(['message' => 'Servicio y archivos eliminados']);
        }

        return response()->json(['message' => 'No encontrado'], 404);
    }
}