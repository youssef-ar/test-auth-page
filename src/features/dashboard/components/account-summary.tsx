import type { CurrentUser } from "@/server/session";

type AccountSummaryProps = {
  user: CurrentUser;
  labels: { account: string; email: string; twoFactor: string; method: string };
};

export const AccountSummary = ({ user, labels }: AccountSummaryProps) => (
  <dl
    aria-label={labels.account}
    className="mt-[2.5rem] flex flex-col divide-y divide-white/10 rounded-s border border-white/10 bg-black/10 text-sx"
  >
    <div className="flex items-center justify-between gap-m px-m py-sm">
      <dt className="text-white/60">{labels.email}</dt>
      <dd className="truncate font-medium text-white">{user.email}</dd>
    </div>
    <div className="flex items-center justify-between gap-m px-m py-sm">
      <dt className="text-white/60">{labels.twoFactor}</dt>
      <dd className="font-medium text-white">{labels.method}</dd>
    </div>
  </dl>
);
