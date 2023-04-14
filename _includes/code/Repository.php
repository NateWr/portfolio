<?php
namespace PKP\submission;

use DAO;

class SubmissionRepository
{
    public DAO $dao;

    public function __construct(DAO $dao)
    {
        $this->dao = $dao;
    }

    public function get(int $id): Submission
    {
        return $this->dao->getByid($id);
    }
}