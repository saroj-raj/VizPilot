"use client";

import React, { useEffect, useState } from "react";

type Props = {
  spec: any;
  data?: any;
  actions?: boolean | object;
};

export default function VegaLiteWrapper({ spec, data, actions }: Props) {
  const [VegaComp, setVegaComp] = useState<any | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("react-vega");
        if (!mounted) return;
        setVegaComp(() => mod.VegaLite || mod.Vega);
      } catch (err: any) {
        console.warn("react-vega failed to load (optional).", err);
        if (!mounted) return;
        setLoadErr(err?.message || "failed to load react-vega");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (VegaComp) {
    return <VegaComp spec={spec} data={data} actions={actions ?? false} />;
  }

  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="text-center text-sm text-gray-500">
        {loadErr ? (
          <div>Chart preview unavailable ({loadErr}).</div>
        ) : (
          <div>Loading chart preview…</div>
        )}
        <div className="text-xs mt-2">Install optional `canvas` support for full render.</div>
      </div>
    </div>
  );
}
