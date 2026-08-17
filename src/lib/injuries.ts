import { supabase } from "./supabase";

export interface InjurySummary {
  id: string;
  personId: string;
  fullName: string;
  teamId: string | null;
  teamName: string | null;
  injuryType: string;
  occurredOn: string;
  status: string;
  severity: string | null;
  nextStageNo: number | null;
  nextStageLabel: string | null;
  nextStageDue: string | null;
  stagesTotal: number;
  stagesCompleted: number;
}

export async function listInjuryRecords(clubId: string): Promise<InjurySummary[]> {
  if (!supabase || !clubId) return [];
  try {
    const { data, error } = await supabase.rpc("list_injury_records", { p_club: clubId });
    if (error || !data) return [];
    return (data as Record<string, any>[]).map((r) => ({
      id: r.id,
      personId: r.person_id,
      fullName: r.full_name ?? "",
      teamId: r.team_id ?? null,
      teamName: r.team_name ?? null,
      injuryType: r.injury_type,
      occurredOn: r.occurred_on,
      status: r.status,
      severity: r.severity ?? null,
      nextStageNo: r.next_stage_no ?? null,
      nextStageLabel: r.next_stage_label ?? null,
      nextStageDue: r.next_stage_due ?? null,
      stagesTotal: Number(r.stages_total ?? 0),
      stagesCompleted: Number(r.stages_completed ?? 0),
    }));
  } catch {
    return [];
  }
}

export interface InjuryStage {
  id: string;
  record_id: string;
  stage_no: number;
  label: string;
  due_on: string | null;
  completed_at: string | null;
  signed_off_by: string | null;
  notes: string | null;
}

export interface InjuryDocument {
  id: string;
  record_id: string;
  club_id: string;
  storage_path: string;
  file_name: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface InjuryRecordDetail {
  id: string;
  club_id: string;
  person_id: string;
  team_id: string | null;
  injury_type: string;
  occurred_on: string;
  context: string | null;
  description: string | null;
  severity: string | null;
  status: string;
  template_id: string | null;
  cleared_on: string | null;
  cleared_by: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InjuryDetail {
  record: InjuryRecordDetail;
  stages: InjuryStage[];
  documents: InjuryDocument[];
}

export async function getInjuryRecord(recordId: string): Promise<InjuryDetail | null> {
  if (!supabase || !recordId) return null;
  try {
    const { data, error } = await supabase.rpc("get_injury_record", { p_record: recordId });
    if (error || !data) return null;
    return data as InjuryDetail;
  } catch {
    return null;
  }
}

export async function createInjuryRecord(
  clubId: string,
  r: {
    personId: string;
    injuryType: string;
    occurredOn: string;
    description?: string | null;
    severity?: string | null;
    teamId?: string | null;
    templateKey?: string | null;
  },
): Promise<{ id?: string; error?: string }> {
  if (!supabase) return { error: "Not connected." };
  try {
    const { data, error } = await supabase.rpc("create_injury_record", {
      p_club: clubId,
      p_person: r.personId,
      p_injury_type: r.injuryType,
      p_occurred_on: r.occurredOn,
      p_description: r.description ?? null,
      p_severity: r.severity ?? null,
      p_team_id: r.teamId ?? null,
      p_template_key: r.templateKey ?? null,
    });
    if (error) return { error: error.message };
    return { id: data as string };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create record." };
  }
}

export async function updateInjuryRecord(
  recordId: string,
  patch: { status?: string; severity?: string | null; description?: string | null; notes?: string | null },
): Promise<string | null> {
  if (!supabase) return "Not connected.";
  try {
    const { error } = await supabase.rpc("update_injury_record", { p_record: recordId, p_patch: patch });
    return error ? error.message : null;
  } catch (e) {
    return e instanceof Error ? e.message : "Could not save.";
  }
}

export async function completeInjuryStage(stageId: string, notes?: string | null): Promise<string | null> {
  if (!supabase) return "Not connected.";
  try {
    const { error } = await supabase.rpc("complete_injury_stage", { p_stage: stageId, p_notes: notes ?? null });
    return error ? error.message : null;
  } catch (e) {
    return e instanceof Error ? e.message : "Could not complete stage.";
  }
}

export interface InjuryDashboardSummary {
  active: number;
  overdueStages: number;
  notCleared: number;
}

export async function getInjuryDashboardSummary(clubId: string): Promise<InjuryDashboardSummary | null> {
  if (!supabase || !clubId) return null;
  try {
    const { data, error } = await supabase.rpc("injury_dashboard_summary", { p_club: clubId });
    if (error || !data) return null;
    const d = data as Record<string, any>;
    return { active: Number(d.active ?? 0), overdueStages: Number(d.overdue_stages ?? 0), notCleared: Number(d.not_cleared ?? 0) };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Documents — private bucket, path {club_id}/{person_id}/{record_id}/{file}.
// ---------------------------------------------------------------------

export async function uploadInjuryDocument(
  clubId: string,
  personId: string,
  recordId: string,
  file: File,
): Promise<{ id?: string; error?: string }> {
  if (!supabase) return { error: "Not connected." };
  try {
    const path = `${clubId}/${personId}/${recordId}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("injury-documents").upload(path, file);
    if (upErr) return { error: upErr.message };
    const { data, error } = await supabase.rpc("register_injury_document", {
      p_record: recordId,
      p_path: path,
      p_file_name: file.name,
    });
    if (error) return { error: error.message };
    return { id: data as string };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

/** True if the signed-in user actively coaches/manages at least one team in this club. */
export async function isInjuryCoach(clubId: string): Promise<boolean> {
  if (!supabase || !clubId) return false;
  try {
    const { data, error } = await supabase.rpc("injury_coach_team_ids", { p_club: clubId });
    if (error || !data) return false;
    return (data as unknown[]).length > 0;
  } catch {
    return false;
  }
}

/** Records for one person, filtered from the caller's accessible set (RLS already scopes it). */
export async function listPersonInjuries(clubId: string, personId: string): Promise<InjurySummary[]> {
  const all = await listInjuryRecords(clubId);
  return all.filter((r) => r.personId === personId);
}

// ---------------------------------------------------------------------
// Reminders — opt-in only. See supabase/functions/injury-stage-reminders and
// supabase/injury-stage-reminders-cron.sql for the (not-yet-deployed) sender.
// ---------------------------------------------------------------------

export async function getInjuryRemindersEnabled(clubId: string): Promise<boolean> {
  if (!supabase || !clubId) return false;
  try {
    const { data, error } = await supabase.from("clubs").select("injury_reminders_enabled").eq("id", clubId).single();
    if (error || !data) return false;
    return !!(data as Record<string, any>).injury_reminders_enabled;
  } catch {
    return false;
  }
}

export async function setInjuryRemindersEnabled(clubId: string, enabled: boolean): Promise<string | null> {
  if (!supabase) return "Not connected.";
  try {
    const { error } = await supabase.rpc("set_injury_reminders_enabled", { p_club: clubId, p_enabled: enabled });
    return error ? error.message : null;
  } catch (e) {
    return e instanceof Error ? e.message : "Could not save.";
  }
}

export async function getInjuryDocumentUrl(storagePath: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage.from("injury-documents").createSignedUrl(storagePath, 60);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
