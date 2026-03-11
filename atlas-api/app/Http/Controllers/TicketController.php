<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\TicketService;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    protected $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    public function index(Request $request)
    {
        $tickets = $this->ticketService->getUserTickets($request->user()->id);
        return response()->json($tickets);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $ticket = Ticket::with('messages')->find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        }

        if ($user->role_id !== 1 && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Acceso denegado. Este ticket pertenece a otra cuenta.'
            ], 403);
        }

        return response()->json($ticket);
    }

    public function store(Request $request)
    {
        $request->validate([
            'asunto' => 'required|string|max:255',
            'categoria' => 'required|string',
            'prioridad' => 'required|string',
            'mensaje' => 'required|string',
        ]);

        $ticket = $this->ticketService->createTicketWithFirstMessage(
            $request->user()->id, 
            $request->all()
        );

        return response()->json($ticket, 201);
    }

    public function reply(Request $request, $id)
    {
        $user = $request->user();
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket no encontrado'], 404);
        }

        if ($user->role_id !== 1 && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Acceso denegado. No puedes responder a un ticket ajeno.'
            ], 403);
        }

        $request->validate([
            'mensaje' => 'required_without:attachments|string|nullable',
            'attachments.*' => 'file|max:10240'
        ]);

        $message = $this->ticketService->addReply(
            $user->id,
            $id,
            $request->mensaje ?? '',
            $request->file('attachments')
        );

        return response()->json($message, 201);
    }

    public function indexAll(Request $request)
    {
        if ($request->user()->role_id != 1) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return response()->json($this->ticketService->getAllTickets());
    }

    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role_id != 1) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $request->validate(['status' => 'required|in:nuevo,abierto,cerrado']);
        
        $ticket = $this->ticketService->changeStatus($id, $request->status);
        return response()->json($ticket);
    }
}