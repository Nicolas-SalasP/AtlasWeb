<?php

namespace App\Providers;

use App\Domain\Erp\Services\ErpClient;
use App\Domain\Erp\Services\ErpPasswordSyncService;
use App\Domain\Order\Models\Order;
use App\Observers\OrderObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ErpClient::class, function ($app) {
            $config = $app['config']->get('services.erp');

            return new ErpClient(
                baseUrl: $config['base_url'],
                apiKey: $config['api_key'],
                timeout: (int) ($config['timeout'] ?? 8),
            );
        });

        $this->app->singleton(ErpPasswordSyncService::class, function ($app) {
            return new ErpPasswordSyncService(
                client: $app->make(ErpClient::class),
            );
        });
    }

    public function boot(): void
    {
        Factory::guessFactoryNamesUsing(function (string $modelName) {
            $relative = str_replace('App\\Domain\\', '', $modelName);
            $relative = str_replace('\\Models\\', '\\', $relative);
            $parts = explode('\\', $relative);
            $class = array_pop($parts);
            return 'Database\\Factories\\' . $class . 'Factory';
        });

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return "{$frontendUrl}/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });
        ResetPassword::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Recuperar Contraseña - Tenri')
                ->view('emails.profile.email_change', ['url' => $url]);
        });

        Order::observe(OrderObserver::class);
    }
}
