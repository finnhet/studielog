<?php

namespace App\Providers;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\Summary;
use App\Models\Timeblock;
use App\Policies\ClassPolicy;
use App\Policies\LocationPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\SummaryPolicy;
use App\Policies\TimeblockPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {

    }

    public function boot(): void
    {
        Gate::policy(Location::class, LocationPolicy::class);
        Gate::policy(ClassModel::class, ClassPolicy::class);
        Gate::policy(Timeblock::class, TimeblockPolicy::class);
        Gate::policy(Reservation::class, ReservationPolicy::class);
        Gate::policy(Summary::class, SummaryPolicy::class);

        Event::listen(SocialiteWasCalled::class, function (SocialiteWasCalled $event) {
            $event->extendSocialite('microsoft', \SocialiteProviders\Microsoft\Provider::class);
        });
    }
}
