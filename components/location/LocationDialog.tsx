"use client";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export function LocationDialog({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (loc: { lat: number; lng: number; address: string }) => void; }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Reverse geocode when position changes
  useEffect(() => {
    if (position) {
      const [lat, lng] = position;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => setAddress(data.display_name || ""));
    }
  }, [position]);

  // Search for address
  useEffect(() => {
    if (!search) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data));
    }, 400);
  }, [search]);

  // Set marker when search result is clicked
  const handleResultClick = (result: any) => {
    setPosition([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchResults([]);
    setSearch(result.display_name);
  };

  // Save location
  const handleSave = () => {
    if (position && address) {
      const [lat, lng] = position;
      localStorage.setItem("user_location", JSON.stringify({ lat, lng, address }));
      onSelect({ lat, lng, address });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a location..."
            className="w-full px-3 py-2 rounded border border-gray-300 mb-2"
          />
          {searchResults.length > 0 && (
            <div className="bg-white border rounded shadow max-h-40 overflow-y-auto z-50 relative">
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleResultClick(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-64 w-full rounded overflow-hidden mb-4">
          <LeafletMap position={position} setPosition={setPosition} />
        </div>
        <div className="mb-4 text-sm text-gray-700 min-h-[2em]">
          {address ? <span>Selected Address: <b>{address}</b></span> : <span className="text-gray-400">No address selected</span>}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={handleSave} disabled={!position || !address} className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-60">Save Location</button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 