"use client";

import { useEffect, useState } from "react";

/**
 * 404 terrain: the land only, plus one × in the clearing. Loaded lazily so the root not-found
 * tree (serialized into every page's RSC payload) doesn't carry a second 35 KB copy of the map.
 */
export function NotFoundTerrain({ marker }: { marker: { left: number; top: number } }) {
  const [inner, setInner] = useState("");
  useEffect(() => {
    let live = true;
    import("@/assets/terrain").then((m) => live && setInner(m.terrainHeroInner));
    return () => {
      live = false;
    };
  }, []);
  return (
    <div className="terrain terrain-plain" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false" dangerouslySetInnerHTML={{ __html: inner }} />
      <span className="nf-marker" style={{ left: `${marker.left}%`, top: `${marker.top}%` }}>
        {"×"}
      </span>
    </div>
  );
}
