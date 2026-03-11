<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->addresses()->orderBy('is_default', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'alias' => 'required|string|max:50',
            'address' => 'required|string|max:255',
            'number' => 'required|string|max:20',
            'depto' => 'nullable|string|max:20',
            'region' => 'nullable|string',
            'commune' => 'nullable|string',
        ]);

        $user = $request->user();
        $isFirst = $user->addresses()->count() === 0;

        $address = $user->addresses()->create([
            'alias' => $request->alias,
            'address' => $request->address,
            'number' => $request->number,
            'depto' => $request->depto,
            'region' => $request->region,
            'commune' => $request->commune,
            'is_default' => $isFirst || $request->is_default
        ]);

        if ($address->is_default && !$isFirst) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        return response()->json($address, 201);
    }

    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();
        return response()->json(['message' => 'Dirección eliminada']);
    }

    public function setDefault(Request $request, $id)
    {
        $user = $request->user();
        $address = $user->addresses()->findOrFail($id);
        $user->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json($address);
    }
}