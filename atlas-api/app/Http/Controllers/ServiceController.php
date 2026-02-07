<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

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
            'image' => 'nullable|image|max:2048',
            'features' => 'nullable'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
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

        $data = $request->all();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
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
        Service::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }
}