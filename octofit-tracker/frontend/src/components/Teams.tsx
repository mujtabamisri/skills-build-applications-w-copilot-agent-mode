import { useState, type FormEvent } from 'react';
import { postJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';

type Team = { _id: string; name: string; mascot: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const { state, reload } = useApiResource<TeamResponse>('/api/teams');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function submitTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSubmitError('');
    const form = event.currentTarget;
    const values = new FormData(form);
    const members = String(values.get('members') ?? '').split(',').map((member) => member.trim()).filter(Boolean);
    try {
      await postJson('/api/teams', { name: values.get('name'), mascot: values.get('mascot'), members });
      form.reset();
      reload();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create this team.');
    } finally {
      setSaving(false);
    }
  }

  return <section aria-labelledby="teams-heading">
    <div className="page-intro"><p className="eyebrow">SQUAD DIRECTORY</p><h2 id="teams-heading">Teams</h2><p>Build a squad and keep its roster together.</p></div>
    <form className="entry-form" onSubmit={submitTeam}>
      <h3>Create a team</h3>
      <div className="form-grid">
        <label>Team name<input className="form-control" name="name" required /></label>
        <label>Mascot<input className="form-control" name="mascot" required /></label>
        <label className="wide-field">Member user IDs<input className="form-control" name="members" placeholder="Optional, comma-separated IDs" /></label>
      </div>
      {submitError && <p role="alert" className="form-error">{submitError}</p>}
      <button className="btn btn-dark" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create team'}</button>
    </form>
    <section className="data-section" aria-label="Team directory">
      <h3>Team directory</h3>
      {state.status === 'loading' && <p role="status">Loading teams…</p>}
      {state.status === 'error' && <p role="alert">Unable to load teams: {state.message}</p>}
      {state.status === 'success' && state.data.teams.length === 0 && <p>No teams yet.</p>}
      {state.status === 'success' && state.data.teams.length > 0 && <div className="table-responsive"><table className="table align-middle"><thead><tr><th scope="col">Team</th><th scope="col">Mascot</th><th scope="col">Members</th></tr></thead><tbody>
        {state.data.teams.map((team) => <tr key={team._id ?? team.name}><th scope="row">{team.name}</th><td>{team.mascot}</td><td>{team.members.length}</td></tr>)}
      </tbody></table></div>}
    </section>
  </section>;
}
