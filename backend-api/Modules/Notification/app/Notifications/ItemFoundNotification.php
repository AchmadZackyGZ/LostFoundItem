<?php

namespace Modules\Notification\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/*
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
 */

class ItemFoundNotification extends Notification
{
    use Queueable;
    protected $item;

    /**
     * Create a new notification instance.
     */
    public function __construct($item)
    {
        $this->item = $item;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        // return ['mail'];
        return ['database'];
    }

    /**
     * Data JSON disimpan ke tabel notifications
     */
    public function toDatabase($notifiable)
    {
        return [
            'item_id'     => $this->item->id,
            'title'       => 'Barang Ditemukan!',
            'message'     => "Barang '{$this->item->name}' yang Anda laporkan hilang telah ditemukan oleh seseorang.",
            'type'        => 'item_found',
            'action_url'  => "/api/items/{$this->item->id}",
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
