'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  MissingChildCase, 
  FoundChildReport, 
  MatchCandidate, 
  VolunteerTask, 
  CrowdZone, 
  AuditLog, 
  Role, 
  Coordinates,
  AlertSeverity
} from '@/types/safety';
import { 
  MOCK_MISSING_CASES, 
  MOCK_FOUND_REPORTS, 
  MOCK_VOLUNTEER_TASKS, 
  MOCK_CROWD_ZONES, 
  MOCK_AUDIT_LOGS, 
  DEEKSHA_BHOOMI_CENTER 
} from '@/lib/mock/seed-data';
import { evaluateCandidateMatch, HIGH_PRIORITY_CANDIDATE_THRESHOLD } from '@/lib/matching/engine';
import { Locale } from '@/lib/i18n/dictionaries';

interface SafetyStoreContextType {
  role: Role;
  setRole: (role: Role) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  missingCases: MissingChildCase[];
  foundReports: FoundChildReport[];
  matchCandidates: MatchCandidate[];
  volunteerTasks: VolunteerTask[];
  crowdZones: CrowdZone[];
  auditLogs: AuditLog[];
  activeNotification: { title: string; message: string; severity: AlertSeverity } | null;
  clearNotification: () => void;
  
  // Actions
  reportMissingChild: (data: Omit<MissingChildCase, 'id' | 'status' | 'severity' | 'otpVerified' | 'assignedVolunteersCount' | 'createdAt' | 'updatedAt'>) => { caseId: string; otp: string };
  verifyCaseOtp: (caseId: string, otp: string) => boolean;
  reportFoundChild: (data: Omit<FoundChildReport, 'id' | 'status' | 'createdAt'>) => { reportId: string; topMatch?: MatchCandidate };
  verifyCandidateMatch: (candidateId: string, decision: 'CONFIRMED' | 'REJECTED', notes: string) => void;
  escalateCaseToRed: (caseId: string, reason: string) => void;
  resolveCaseReunited: (caseId: string) => void;
  acceptVolunteerTask: (taskId: string) => void;
  startVolunteerTask: (taskId: string) => void;
  volunteerCheckin: (taskId: string) => void;
  completeVolunteerTask: (taskId: string) => void;
  declineVolunteerTask: (taskId: string) => void;
  simulateCrowdSpike: (zoneId: string, newCount: number) => void;
  addAuditLog: (action: string, targetType: AuditLog['targetType'], targetId: string, details: Record<string, any>) => void;
}

const SafetyStoreContext = createContext<SafetyStoreContextType | undefined>(undefined);

export function SafetyStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('CONTROL_ROOM');
  const [locale, setLocale] = useState<Locale>('en');
  
  const [missingCases, setMissingCases] = useState<MissingChildCase[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_cases');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_MISSING_CASES;
  });

  const [foundReports, setFoundReports] = useState<FoundChildReport[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_found');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_FOUND_REPORTS;
  });

  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_tasks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_VOLUNTEER_TASKS;
  });

  const [crowdZones, setCrowdZones] = useState<CrowdZone[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_crowd');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_CROWD_ZONES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mehfus_audit');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_AUDIT_LOGS;
  });

  const [matchCandidates, setMatchCandidates] = useState<MatchCandidate[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; severity: AlertSeverity } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_cases', JSON.stringify(missingCases));
    }
  }, [missingCases]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_found', JSON.stringify(foundReports));
    }
  }, [foundReports]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_tasks', JSON.stringify(volunteerTasks));
    }
  }, [volunteerTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_crowd', JSON.stringify(crowdZones));
    }
  }, [crowdZones]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mehfus_audit', JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  // Evaluate candidate matches whenever cases or found reports change
  useEffect(() => {
    const candidates: MatchCandidate[] = [];
    missingCases.forEach((mCase) => {
      if (mCase.status === 'SEARCHING' || mCase.status === 'MATCH_CANDIDATE_FOUND') {
        foundReports.forEach((fReport) => {
          if (fReport.status !== 'RESOLVED' && fReport.status !== 'DISMISSED') {
            const candidate = evaluateCandidateMatch(mCase, fReport);
            candidates.push(candidate);
          }
        });
      }
    });

    // Sort by composite score descending
    candidates.sort((a, b) => b.compositeScore - a.compositeScore);
    setMatchCandidates(candidates);
  }, [missingCases, foundReports]);

  const addAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: Record<string, any>) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: role === 'CONTROL_ROOM' ? 'USR-02 (Meera Joshi)' : role === 'HELP_DESK' ? 'USR-01 (SI Kadam)' : 'CITIZEN_DEVICE',
      actorRole: role,
      action,
      targetType,
      targetId,
      ipAddress: '192.168.1.108 (Verified TLS Client)',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const clearNotification = () => setActiveNotification(null);

  // 1. Report Missing Child
  const reportMissingChild = (data: Omit<MissingChildCase, 'id' | 'status' | 'severity' | 'otpVerified' | 'assignedVolunteersCount' | 'createdAt' | 'updatedAt'>) => {
    const caseId = `DB-2026-0${missingCases.length + 1}`;
    const otp = "492015"; // Simulated 6-digit OTP

    const newCase: MissingChildCase = {
      ...data,
      id: caseId,
      status: 'SEARCHING',
      severity: 'ORANGE',
      otpVerified: true,
      assignedVolunteersCount: 4,
      searchRadiusMeters: data.searchRadiusMeters || 2000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMissingCases((prev) => [newCase, ...prev]);

    // Create automated Volunteer Dispatch task for demo
    const newTask: VolunteerTask = {
      id: `TSK-${Date.now()}`,
      volunteerId: 'VOL-01',
      volunteerName: 'Rajesh Deshmukh',
      caseId,
      childSummary: {
        name: newCase.childName,
        age: newCase.age,
        gender: newCase.gender,
        clothing: `${newCase.clothing.top}, ${newCase.clothing.bottom}`,
        photoUrl: newCase.photoUrl,
      },
      searchZoneName: 'Sector 1 (Radial 2.0 km Search Zone)',
      searchCoordinates: newCase.lastSeenLocation,
      status: 'ASSIGNED',
      safetyCheckinCount: 0,
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 1000).toISOString(), // 60 second cascade
    };

    setVolunteerTasks((prev) => [newTask, ...prev]);

    addAuditLog('MISSING_CASE_CREATED_ORANGE', 'CASE', caseId, {
      childName: newCase.childName,
      age: newCase.age,
      radiusMeters: newCase.searchRadiusMeters,
      landmark: newCase.lastSeenLocation.landmark,
    });

    setActiveNotification({
      title: 'ORANGE ALERT: Missing Child Case Registered',
      message: `Guardian Mesh activated for ${newCase.childName}. 4 volunteers notified in 2.0 km zone.`,
      severity: 'ORANGE',
    });

    return { caseId, otp };
  };

  const verifyCaseOtp = (caseId: string, otp: string) => {
    if (otp === '492015' || otp.length === 6) {
      setMissingCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, otpVerified: true } : c))
      );
      addAuditLog('OTP_VERIFIED_ALERT_ACTIVATED', 'CASE', caseId, { otpEntered: otp });
      return true;
    }
    return false;
  };

  // 2. Report Found Child (Doubt vs Sighting)
  const reportFoundChild = (data: Omit<FoundChildReport, 'id' | 'status' | 'createdAt'>) => {
    const reportId = `FND-2026-0${foundReports.length + 1}`;

    const newReport: FoundChildReport = {
      ...data,
      id: reportId,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    };

    setFoundReports((prev) => [newReport, ...prev]);

    addAuditLog('FOUND_CHILD_REPORTED', 'FOUND_REPORT', reportId, {
      reportType: newReport.reportType,
      estimatedAge: newReport.estimatedAge,
      landmark: newReport.foundLocation.landmark,
      isAnonymous: newReport.isAnonymous,
    });

    // Run immediate two-way matching
    let topMatchCandidate: MatchCandidate | undefined;
    let highestScore = 0;

    missingCases.forEach((mCase) => {
      if (mCase.status === 'SEARCHING') {
        const candidate = evaluateCandidateMatch(mCase, newReport);
        if (candidate.compositeScore > highestScore) {
          highestScore = candidate.compositeScore;
          topMatchCandidate = candidate;
        }
      }
    });

    if (topMatchCandidate && topMatchCandidate.compositeScore >= HIGH_PRIORITY_CANDIDATE_THRESHOLD) {
      setActiveNotification({
        title: 'HIGH CONFIDENCE MATCH CANDIDATE!',
        message: `Found report ${reportId} matches ${topMatchCandidate.missingCaseId} with ${(topMatchCandidate.compositeScore * 100).toFixed(1)}% confidence score.`,
        severity: 'RED',
      });
      addAuditLog('HIGH_PRIORITY_MATCH_PINNED', 'MATCH', topMatchCandidate.id, {
        score: topMatchCandidate.compositeScore,
        breakdown: topMatchCandidate.breakdown,
      });
    }

    return { reportId, topMatch: topMatchCandidate };
  };

  // 3. Human Verification of Candidate Match
  const verifyCandidateMatch = (candidateId: string, decision: 'CONFIRMED' | 'REJECTED', notes: string) => {
    setMatchCandidates((prev) =>
      prev.map((cand) =>
        cand.id === candidateId
          ? { ...cand, humanVerified: true, decision, decisionNotes: notes }
          : cand
      )
    );

    const targetCand = matchCandidates.find((c) => c.id === candidateId);
    if (targetCand) {
      if (decision === 'CONFIRMED') {
        // Mark missing case as REUNITED
        resolveCaseReunited(targetCand.missingCaseId);
        // Mark found report as RESOLVED
        setFoundReports((prev) =>
          prev.map((fr) => (fr.id === targetCand.foundReportId ? { ...fr, status: 'RESOLVED' } : fr))
        );
      } else {
        // Mark found report as DISMISSED
        setFoundReports((prev) =>
          prev.map((fr) => (fr.id === targetCand.foundReportId ? { ...fr, status: 'DISMISSED' } : fr))
        );
      }

      addAuditLog('HUMAN_MATCH_DECISION', 'MATCH', candidateId, {
        decision,
        notes,
        missingCaseId: targetCand.missingCaseId,
        foundReportId: targetCand.foundReportId,
      });
    }
  };

  // 4. Case Escalation
  const escalateCaseToRed = (caseId: string, reason: string) => {
    setMissingCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              severity: 'RED',
              searchRadiusMeters: 3500,
              assignedVolunteersCount: c.assignedVolunteersCount + 5,
            }
          : c
      )
    );

    addAuditLog('CASE_ESCALATED_TO_RED', 'CASE', caseId, { reason, expandedRadius: '3500m' });

    setActiveNotification({
      title: 'RED ALERT ESCALATION',
      message: `Case ${caseId} escalated to RED ALERT. Search perimeter expanded to 3.5 km. Law enforcement dispatched.`,
      severity: 'RED',
    });
  };

  // 5. Case Resolution
  const resolveCaseReunited = (caseId: string) => {
    setMissingCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'REUNITED',
              reunitedAt: new Date().toISOString(),
            }
          : c
      )
    );

    addAuditLog('CHILD_REUNITED_SUCCESS', 'CASE', caseId, {
      resolvedAt: new Date().toISOString(),
      closedBy: 'Control Room Authorization',
    });

    setActiveNotification({
      title: 'CHILD SAFELY REUNITED!',
      message: `Case ${caseId} has been successfully resolved. Child reunited with family.`,
      severity: 'YELLOW',
    });
  };

  // 6. Volunteer Task Actions
  const acceptVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'ACCEPTED' } : t))
    );
    addAuditLog('VOLUNTEER_TASK_ACCEPTED', 'VOLUNTEER', taskId, {});
  };

  const startVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t))
    );
    addAuditLog('VOLUNTEER_TASK_STARTED', 'VOLUNTEER', taskId, {});
  };

  const volunteerCheckin = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              safetyCheckinCount: t.safetyCheckinCount + 1,
              lastCheckinTime: new Date().toISOString(),
            }
          : t
      )
    );
    addAuditLog('VOLUNTEER_SAFETY_CHECKIN', 'VOLUNTEER', taskId, {
      timestamp: new Date().toISOString(),
    });
  };

  const completeVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
          : t
      )
    );
    addAuditLog('VOLUNTEER_TASK_COMPLETED', 'VOLUNTEER', taskId, {});
  };

  const declineVolunteerTask = (taskId: string) => {
    setVolunteerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'DECLINED' } : t))
    );
    addAuditLog('VOLUNTEER_TASK_DECLINED_CASCADING', 'VOLUNTEER', taskId, {
      cascadeTriggered: true,
    });
  };

  // 7. Crowd Density Simulation
  const simulateCrowdSpike = (zoneId: string, newCount: number) => {
    setCrowdZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const density = parseFloat(((newCount / zone.capacity) * 100).toFixed(1));
          let level: CrowdZone['thresholdLevel'] = 'NORMAL';
          let rec = 'Routine flow. No gate intervention required.';

          if (density >= 95) {
            level = 'EMERGENCY';
            rec = 'CRITICAL: Trigger zone evacuation protocol and suspend new search tasks.';
          } else if (density >= 85) {
            level = 'CRITICAL';
            rec = 'ORANGE THRESHOLD: Open auxiliary East gates 4A & 4B. Reroute pedestrian flow.';
          } else if (density >= 70) {
            level = 'ELEVATED';
            rec = 'YELLOW THRESHOLD: Pace admissions at entry concourse.';
          }

          return {
            ...zone,
            currentCount: newCount,
            densityPercentage: density,
            thresholdLevel: level,
            recommendation: rec,
            provenance: 'SIMULATED',
            lastUpdated: new Date().toISOString(),
          };
        }
        return zone;
      })
    );

    addAuditLog('CROWD_DENSITY_UPDATED', 'CROWD', zoneId, { newCount });
  };

  return (
    <SafetyStoreContext.Provider
      value={{
        role,
        setRole,
        locale,
        setLocale,
        missingCases,
        foundReports,
        matchCandidates,
        volunteerTasks,
        crowdZones,
        auditLogs,
        activeNotification,
        clearNotification,
        reportMissingChild,
        verifyCaseOtp,
        reportFoundChild,
        verifyCandidateMatch,
        escalateCaseToRed,
        resolveCaseReunited,
        acceptVolunteerTask,
        startVolunteerTask,
        volunteerCheckin,
        completeVolunteerTask,
        declineVolunteerTask,
        simulateCrowdSpike,
        addAuditLog,
      }}
    >
      {children}
    </SafetyStoreContext.Provider>
  );
}

export function useSafetyStore() {
  const context = useContext(SafetyStoreContext);
  if (!context) {
    throw new Error('useSafetyStore must be used within a SafetyStoreProvider');
  }
  return context;
}
