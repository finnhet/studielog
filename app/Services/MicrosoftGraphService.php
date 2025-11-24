<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MicrosoftGraphService
{
    protected $accessToken;

    public function setAccessToken(string $token)
    {
        $this->accessToken = $token;
        return $this;
    }

    public function getAuthUrl()
    {
        $params = [
            'client_id' => config('services.microsoft.client_id'),
            'response_type' => 'code',
            'redirect_uri' => config('services.microsoft.redirect_uri'),
            'response_mode' => 'query',
            'scope' => 'User.Read Calendars.ReadWrite Mail.ReadWrite Mail.Send offline_access',
        ];

        return 'https://login.microsoftonline.com/' . config('services.microsoft.tenant_id') . '/oauth2/v2.0/authorize?' . http_build_query($params);
    }

    public function getAccessToken(string $code)
    {
        $response = Http::asForm()->post('https://login.microsoftonline.com/' . config('services.microsoft.tenant_id') . '/oauth2/v2.0/token', [
            'client_id' => config('services.microsoft.client_id'),
            'client_secret' => config('services.microsoft.client_secret'),
            'code' => $code,
            'redirect_uri' => config('services.microsoft.redirect_uri'),
            'grant_type' => 'authorization_code',
        ]);

        return $response->json();
    }

    public function refreshAccessToken(string $refreshToken)
    {
        $response = Http::asForm()->post('https://login.microsoftonline.com/' . config('services.microsoft.tenant_id') . '/oauth2/v2.0/token', [
            'client_id' => config('services.microsoft.client_id'),
            'client_secret' => config('services.microsoft.client_secret'),
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        return $response->json();
    }

    public function createCalendarEvent(array $data)
    {
        $event = [
            'subject' => $data['subject'],
            'body' => [
                'contentType' => 'HTML',
                'content' => $data['body'] ?? ''
            ],
            'start' => [
                'dateTime' => $data['start_time'],
                'timeZone' => 'Europe/Amsterdam'
            ],
            'end' => [
                'dateTime' => $data['end_time'],
                'timeZone' => 'Europe/Amsterdam'
            ],
            'location' => [
                'displayName' => $data['location'] ?? ''
            ]
        ];

        try {
            $response = Http::withToken($this->accessToken)
                ->post('https://graph.microsoft.com/v1.0/me/events', $event);

            if ($response->successful()) {
                $result = $response->json();
                return [
                    'id' => $result['id'],
                    'subject' => $result['subject'],
                ];
            } else {
                \Log::error('Graph API create event error: ' . $response->body());
                throw new \Exception('Failed to create event: ' . $response->body());
            }
        } catch (\Exception $e) {
            \Log::error('Graph API create event error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function updateCalendarEvent(string $eventId, array $data)
    {
        $event = [];

        if (isset($data['subject'])) {
            $event['subject'] = $data['subject'];
        }

        if (isset($data['start_time'])) {
            $event['start'] = [
                'dateTime' => $data['start_time'],
                'timeZone' => 'Europe/Amsterdam'
            ];
        }

        if (isset($data['end_time'])) {
            $event['end'] = [
                'dateTime' => $data['end_time'],
                'timeZone' => 'Europe/Amsterdam'
            ];
        }

        if (isset($data['location'])) {
            $event['location'] = [
                'displayName' => $data['location']
            ];
        }

        try {
            $response = Http::withToken($this->accessToken)
                ->patch('https://graph.microsoft.com/v1.0/me/events/' . $eventId, $event);

            if ($response->successful()) {
                $result = $response->json();
                return [
                    'id' => $result['id'],
                    'subject' => $result['subject'],
                ];
            } else {
                \Log::error('Graph API update event error: ' . $response->body());
                throw new \Exception('Failed to update event: ' . $response->body());
            }
        } catch (\Exception $e) {
            \Log::error('Graph API update event error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function deleteCalendarEvent(string $eventId)
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->delete('https://graph.microsoft.com/v1.0/me/events/' . $eventId);

            return $response->successful();
        } catch (\Exception $e) {
            \Log::error('Graph API delete event error: ' . $e->getMessage());
            return false;
        }
    }

    public function sendMail(array $data)
    {
        $message = [
            'message' => [
                'subject' => $data['subject'],
                'body' => [
                    'contentType' => 'HTML',
                    'content' => $data['body']
                ],
                'toRecipients' => array_map(function($email) {
                    return [
                        'emailAddress' => [
                            'address' => $email
                        ]
                    ];
                }, $data['to'])
            ],
            'saveToSentItems' => true
        ];

        $response = Http::withToken($this->accessToken)
            ->post('https://graph.microsoft.com/v1.0/me/sendMail', $message);

        return $response->successful();
    }

    public function getCalendarEvents(string $startDate, string $endDate)
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->get('https://graph.microsoft.com/v1.0/me/calendarView', [
                    'startDateTime' => $startDate,
                    'endDateTime' => $endDate,
                ]);

            return $response->json();
        } catch (\Exception $e) {
            \Log::error('Graph API get events error: ' . $e->getMessage());
            return ['value' => []];
        }
    }
}
