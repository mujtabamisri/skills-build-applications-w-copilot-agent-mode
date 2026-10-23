import { useState, type FormEvent } from 'react';
import { postJson } from '../api/client.js';
import { useApiResource } from '../api/useApiResource.js';

type Activity = { user: string; team: string; type: string; minutes: number; points: number; occurredAt: string };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const { state, reload } = useApiResource<ActivityResponse>('/api/activities');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setSubmitError('');
    const values = new FormData(form);
    try {
      await postJson('/api/activities', {
        userId: values.get('userId'),
        teamId: values.get('teamId'),
        type: values.get('type'),
        minutes: Number(values.get('minutes')),
      });
      form.reset();
      reload();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save this activity.');
    } finally {
      setSaving(false);
    }
  }

  return <section aria-labelledby="activities-heading">
    <div className="page-intro"><p className="eyebrow">MOVEMENT LOG</p><h2 id="activities-heading">Activities</h2><p>Record a session and see its contribution to team points.</p></div>
    <form className="entry-form" onSubmit={submitActivity}>
      <h3>Log an activity</h3>
      <div className="form-grid">
        <label>User ID<input className="form-control" name="userId" required pattern="[a-fA-F0-9]{24}" title="Enter a 24-character user ID" /></label>
        <label>Team ID<input className="form-control" name="teamId" required pattern="[a-fA-F0-9]{24}" title="Enter a 24-character team ID" /></label>
        <label>Activity type<input className="form-control" name="type" required placeholder="Run" /></label>
        <label>Minutes<input className="form-control" name="minutes" type="number" min="1" required /></label>
      </div>
      {submitError && <p role="alert" className="form-error">{submitError}</p>}
      <button className="btn btn-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add activity'}</button>
    </form>
    <section className="data-section" aria-label="Activity history">
      <h3>Recent activity</h3>
      {state.status === 'loading' && <p role="status">Loading activities…</p>}
      {state.status === 'error' && <p role="alert">Unable to load activities: {state.message}</p>}
      {state.status === 'success' && state.data.activities.length === 0 && <p>No activities yet.</p>}
      {state.status === 'success' && state.data.activities.length > 0 && <div className="table-responsive"><table className="table align-middle"><thead><tr><th scope="col">Activity</th><th scope="col">Minutes</th><th scope="col">Points</th><th scope="col">Recorded</th></tr></thead><tbody>
        {state.data.activities.map((activity, index) => <tr key={`${activity.occurredAt}-${index}`}><th scope="row">{activity.type}</th><td>{activity.minutes}</td><td>{activity.points}</td><td>{new Date(activity.occurredAt).toLocaleString()}</td></tr>)}
      </tbody></table></div>}
    </section>
  </section>;
}
