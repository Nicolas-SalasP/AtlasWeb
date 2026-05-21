<?php

namespace App\Domain\Ticket\Services;

use App\Domain\Ticket\Exceptions\AttachmentUploadException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class TicketAttachmentService
{
    public function uploadAll(array $files): array
    {
        $stored = [];
        $storedPaths = [];

        try {
            foreach ($files as $file) {
                if (!$file instanceof UploadedFile) {
                    continue;
                }

                $extension = $file->getClientOriginalExtension();
                $filename = Str::random(25) . '.' . $extension;
                $path = $file->storeAs('tickets', $filename, 'public');

                if ($path === false) {
                    throw new AttachmentUploadException("No se pudo almacenar el archivo {$file->getClientOriginalName()}");
                }

                $storedPaths[] = $path;

                $stored[] = [
                    'path' => '/storage/' . $path,
                    'name' => htmlspecialchars($file->getClientOriginalName(), ENT_QUOTES, 'UTF-8'),
                    'mime' => $file->getClientMimeType(),
                ];
            }
        } catch (Throwable $e) {
            foreach ($storedPaths as $path) {
                Storage::disk('public')->delete($path);
            }

            if ($e instanceof AttachmentUploadException) {
                throw $e;
            }

            throw new AttachmentUploadException($e->getMessage(), $e);
        }

        return $stored;
    }

    public function deletePhysical(array $attachments): void
    {
        foreach ($attachments as $attachment) {
            $url = $attachment['path'] ?? null;
            if (!is_string($url)) {
                continue;
            }

            $relative = str_replace('/storage/', '', $url);

            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }
}
