"use client";

import { useState, useEffect } from "react";

interface ReferralData {
  code: string | null;
  joinedCount: number;
  link: string;
  masterPdfGoal: number;
  masterPdfUnlocked: boolean;
}

export function useReferral(): ReferralData {
  const [data, setData] = useState<ReferralData>({
    code: null,
    joinedCount: 0,
    link: "",
    masterPdfGoal: 5,
    masterPdfUnlocked: false,
  });

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.code) {
          const link = window.location.origin + "/signup?ref=" + d.code;
          setData({
            code: d.code,
            joinedCount: d.joinedCount ?? d.approvedCount ?? 0,
            link,
            masterPdfGoal: d.masterPdfGoal ?? 5,
            masterPdfUnlocked: !!d.masterPdfUnlocked,
          });
        }
      })
      .catch(() => {});
  }, []);

  return data;
}
