import { Activity, Team, User, Workout } from '../models/index.js';

const objectIdPattern = /^[a-f\d]{24}$/i;

function clientError(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw clientError('Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || !objectIdPattern.test(userId) || typeof teamId !== 'string' || !objectIdPattern.test(teamId)) {
    throw clientError('Valid userId and teamId values are required');
  }
  if (typeof type !== 'string' || !type.trim() || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw clientError('A type and positive number of minutes are required');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw clientError('The selected user and team must exist', 404);
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw clientError('Team details are required');
  const { name, mascot } = input;
  const memberIds = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw clientError('A team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw clientError('A team mascot is required');
  if (!Array.isArray(memberIds) || memberIds.some((memberId) => typeof memberId !== 'string' || !objectIdPattern.test(memberId))) {
    throw clientError('Team members must be an array of valid user IDs');
  }
  const uniqueMemberIds = [...new Set(memberIds as string[])];
  const users = await User.find({ _id: { $in: uniqueMemberIds } });
  if (users.length !== uniqueMemberIds.length) throw clientError('Every team member must be an existing user', 404);

  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
  for (const user of users) {
    if (user.team && user.team.toString() !== team._id.toString()) {
      await Team.updateOne({ _id: user.team }, { $pull: { members: user._id } });
    }
    user.team = team._id;
    await user.save();
  }
  return team;
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw clientError('No user was found for that email address', 404);

  const [workouts, recentActivity] = await Promise.all([
    Workout.find().lean(),
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
  ]);
  const goalFocus = user.fitnessGoal.toLowerCase();
  const activityFocusByType: Record<string, string> = {
    cycle: 'endurance',
    cycling: 'endurance',
    run: 'endurance',
    running: 'endurance',
    walk: 'endurance',
    walking: 'endurance',
    strength: 'strength',
    yoga: 'mobility',
  };
  const recentFocus = recentActivity
    ? activityFocusByType[recentActivity.type.toLowerCase()] ?? recentActivity.type.toLowerCase()
    : undefined;
  const preferredFocus = workouts.some((workout) => workout.focus.toLowerCase() === goalFocus)
    ? goalFocus
    : recentFocus;

  return workouts
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      let reason = 'A balanced option to keep your fitness routine varied.';
      if (focus === goalFocus) reason = `Supports your ${user.fitnessGoal} fitness goal.`;
      else if (recentActivity && focus === recentFocus) reason = `Builds on your recent ${recentActivity.type} activity.`;
      return { ...workout, reason };
    })
    .sort((left, right) => Number(right.focus.toLowerCase() === preferredFocus) - Number(left.focus.toLowerCase() === preferredFocus));
}

export { User };
