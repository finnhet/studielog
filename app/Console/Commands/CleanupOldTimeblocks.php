<?php

namespace App\Console\Commands;

use App\Models\Timeblock;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupOldTimeblocks extends Command
{
    protected $signature = 'timeblocks:cleanup';

    protected $description = 'Remove old timeblocks where the date has passed, but keep those with summaries or reservations';

    public function handle(): int
    {
        $deleted = Timeblock::where('end_time', '<', Carbon::now())
            ->whereDoesntHave('summaries')
            ->whereDoesntHave('reservations')
            ->delete();

        $this->info("Deleted {$deleted} old timeblock(s) without summaries or reservations.");

        return Command::SUCCESS;
    }
}
