import { useState, type FormEvent } from 'react';
import { useApiResource } from '../api/useApiResource.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const [email, setEmail] = useState('mona@example.com');
  const [requestedEmail, setRequestedEmail] = useState('mona@example.com');
  const { state } = useApiResource<WorkoutResponse>(`/api/workouts/suggestions/${encodeURIComponent(requestedEmail)}`);

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestedEmail(email.trim());
  }

  return <section aria-labelledby="workouts-heading">
    <div className="page-intro"><p className="eyebrow">PERSONAL TRAINING</p><h2 id="workouts-heading">Workout suggestions</h2><p>Recommendations shaped by each athlete’s goal and recent movement.</p></div>
    <form className="lookup-form" onSubmit={submitEmail}>
      <label htmlFor="workout-email">Athlete email</label>
      <div className="lookup-controls"><input id="workout-email" className="form-control" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /><button className="btn btn-dark" type="submit">Find workouts</button></div>
    </form>
    <section className="data-section" aria-label="Recommended workouts">
      {state.status === 'loading' && <p role="status">Loading workout suggestions…</p>}
      {state.status === 'error' && <p role="alert">Unable to load workout suggestions: {state.message}</p>}
      {state.status === 'success' && state.data.suggestions.length === 0 && <p>No workout suggestions available.</p>}
      {state.status === 'success' && state.data.suggestions.length > 0 && <ul className="workout-list">{state.data.suggestions.map((workout) => <li key={workout.title}>
        <div><h3>{workout.title}</h3><p>{workout.reason}</p></div><p className="workout-meta">{workout.focus} · {workout.minutes} min · {workout.difficulty}</p>
      </li>)}</ul>}
    </section>
  </section>;
}
