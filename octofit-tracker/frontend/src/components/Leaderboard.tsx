import { useApiResource } from '../api/useApiResource.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const { state } = useApiResource<LeaderboardResponse>('/api/leaderboard');
  return <section aria-labelledby="leaderboard-heading">
    <div className="page-intro"><p className="eyebrow">SEASON SCOREBOARD</p><h2 id="leaderboard-heading">Leaderboard</h2><p>Team standings by earned activity points.</p></div>
    {state.status === 'loading' && <p role="status">Loading leaderboard…</p>}
    {state.status === 'error' && <p role="alert">Unable to load leaderboard: {state.message}</p>}
    {state.status === 'success' && state.data.leaderboard.length === 0 && <p>No leaderboard scores yet.</p>}
    {state.status === 'success' && state.data.leaderboard.length > 0 && <div className="table-responsive"><table className="table standings-table"><thead><tr><th scope="col">Rank</th><th scope="col">Team</th><th scope="col">Points</th></tr></thead><tbody>
      {state.data.leaderboard.map((entry) => <tr key={entry.teamName}><th scope="row">{entry.rank}</th><td>{entry.teamName}</td><td>{entry.totalPoints}</td></tr>)}
    </tbody></table></div>}
  </section>;
}
