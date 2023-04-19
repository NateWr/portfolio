class ReviewAssignmentDAO extends DAO
{
    public function getByRound($round)
    {
        $result = $this->retrieve(
            'SELECT * FROM ... WHERE round=?',
            [(int) $round]
        );
        return $this->fromRow($result);
    }

    public function getCompletedByRound($round)
    {
        $result = $this->retrieve(
            'SELECT * FROM ... WHERE round=? and completed=1',
            [(int) $round]
        );
        return $this->fromRow($result);
    }
}