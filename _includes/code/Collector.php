<?php
namespace PKP\submissions;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class Collector
{
    public ?array $assignedTo = null;
    public ?array $status = null;

    public function filterByAssignedTo(?array $assignedTo): self
    {
        $this->assignedTo = $assignedTo;
        return $this;
    }

    public function filterByStatus(?array $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getQueryBuilder(): Builder
    {
        return DB::table(...)
            ->select(...)
            ->when(
                $this->status !== null,
                function (Builder $q) {
                    $q->whereIn('status', $this->status);
                }
            )
            ->when(
                $this->assignedTo !== null,
                function (Builder $q) {
                    $q->whereIn('assignedTo', $this->assignedTo);
                }
            );
    }
}