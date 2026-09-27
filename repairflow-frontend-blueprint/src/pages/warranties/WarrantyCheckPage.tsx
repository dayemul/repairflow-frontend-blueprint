import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Warranty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { ShieldCheck, Search, Award, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export const WarrantyCheckPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [query, setQuery] = useState('WAR-2026-0099');
  const [result, setResult] = useState<Warranty | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const match = storageService.getWarrantyByCode(query.trim());
    setResult(match || null);
    setSearched(true);
  };

  const isExpired = result && new Date(result.endDate).getTime() < Date.now();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between py-2">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Workshop Terminal</span>
        </button>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          FixFlow Official Verification Portal
        </span>
      </div>

      {/* Main card */}
      <div className="max-w-2xl w-full mx-auto my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Warranty Status Verification
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Enter your Warranty Certificate ID or device IMEI/Serial number to check guarantee validity and coverage terms.
          </p>
        </div>

        {/* Search input form */}
        <Card className="bg-slate-800/90 border-slate-700/80 p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Warranty Code (e.g. WAR-2026-0099) or Device IMEI..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 pr-28 text-white placeholder:text-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
              <Button
                type="submit"
                variant="primary"
                className="absolute right-2 top-2 bottom-2 text-xs px-4 gap-1.5 font-bold"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>Try sample serials:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('WAR-2026-0099');
                  const match = storageService.getWarrantyByCode('WAR-2026-0099');
                  setResult(match || null);
                  setSearched(true);
                }}
                className="text-blue-400 hover:underline font-mono"
              >
                WAR-2026-0099 (Active iPhone 15)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setQuery('WAR-2026-0084');
                  const match = storageService.getWarrantyByCode('WAR-2026-0084');
                  setResult(match || null);
                  setSearched(true);
                }}
                className="text-amber-400 hover:underline font-mono"
              >
                WAR-2026-0084 (Expired)
              </button>
            </div>
          </form>

          {/* Result Card */}
          {searched && (
            <div className="mt-6 pt-6 border-t border-slate-700/60">
              {result ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      !isExpired && result.status === 'ACTIVE'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {!isExpired && result.status === 'ACTIVE' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-sm">
                          {!isExpired && result.status === 'ACTIVE'
                            ? 'WARRANTY VALID & ACTIVE'
                            : 'WARRANTY EXPIRED OR VOID'}
                        </div>
                        <div className="text-xs opacity-80 mt-0.5">
                          Certificate Serial: <strong className="font-mono">{result.warrantyCode}</strong>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded bg-black/30">
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">
                        Customer
                      </span>
                      <strong className="text-white text-sm">{result.customerName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">
                        Device Model
                      </span>
                      <strong className="text-white text-sm">{result.deviceModel}</strong>
                      <div className="text-[10px] text-slate-400 font-mono">SN: {result.imeiOrSerial}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">
                        Guaranteed Coverage
                      </span>
                      <p className="text-slate-300 font-medium">{result.coverageDetails}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">
                        Warranty Period
                      </span>
                      <p className="text-slate-300 font-mono">
                        <DateDisplay value={result.startDate} /> — <DateDisplay value={result.endDate} />
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 p-3 bg-slate-900/40 rounded-xl border border-slate-800 leading-relaxed">
                    <strong className="text-slate-300">Policy Terms:</strong> {result.terms}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <XCircle className="w-10 h-10 text-rose-500/80 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No Matching Warranty Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    We could not find any active warranty matching "{query}". Please double-check your receipt or contact FixFlow customer support.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-4">
        © 2026 FixFlow Precision Electronics Lab. All warranties issued under standard consumer electronics guarantee protocols.
      </div>
    </div>
  );
};
