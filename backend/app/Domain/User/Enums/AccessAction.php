<?php

namespace App\Domain\User\Enums;

enum AccessAction: string
{
    case RegisterSuccess = 'Registro Exitoso';
    case LoginSuccess = 'Inicio de Sesión Exitoso';
    case LoginFailure = 'Intento de Login Fallido';
    case Logout = 'Cierre de Sesión';
    case PasswordResetRequested = 'Solicitud Recuperación de Contraseña';
    case PasswordReset = 'Contraseña Restablecida';
    case PasswordChanged = 'Contraseña Cambiada';
    case EmailChangeRequested = 'Solicitud de Cambio de Correo';
    case EmailChanged = 'Correo Cambiado';
    case OrderClaimSuccess = 'Reclamación de Órdenes Confirmada';
}
