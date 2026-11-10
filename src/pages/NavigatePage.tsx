import { useState } from 'react';
import {
  MapPin,
  Search,
  Building2,
  Train,
  Bus,
  Volume2,
  Navigation,
  Compass,
  CornerDownRight,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import DemoBanner from '../components/ui/DemoBanner';
import Disclaimer from '../components/ui/Disclaimer';
import Modal from '../components/ui/Modal';
import { DEMO_PUBLIC_PLACES } from '../data/mockData';
import { ttsService } from '../services/textToSpeech';
import { useApp } from '../context/AppContext';
import type { PublicPlace, PlaceCategory } from '../types';

export default function NavigatePage() {
  const { preferences } = useApp();
  const [places] = useState<PublicPlace[]>(DEMO_PUBLIC_PLACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [activePlace, setActivePlace] = useState<PublicPlace | null>(null);
  const [navigatingDestination, setNavigatingDestination] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'All Places' },
    { key: 'hospital', label: 'Hospitals', icon: Building2 },
    { key: 'railway', label: 'Railway Stations', icon: Train },
    { key: 'bus', label: 'Bus Terminals', icon: Bus },
  ];

  const filteredPlaces = places.filter((place) => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesQuery =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.destinations.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleSpeak = (text: string, id: string) => {
    if (readingId === id) {
      ttsService.stop();
      setReadingId(null);
      return;
    }
    setReadingId(id);
    ttsService
      .speak(text, {
        language: 'en-US',
        rate: preferences.speechSpeed || 1.0,
        volume: 1.0,
      })
      .finally(() => setReadingId(null));
  };

  const startNavigation = (dest: string) => {
    setNavigatingDestination(dest);
    handleSpeak(
      `Starting navigation towards ${dest}. Follow tactile floor markers straight for 20 meters, then turn right.`,
      `nav-${dest}`
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Find My Way"
        subtitle="Directory of public hubs, accessible routes, and indoor facility navigation."
        showBack
      />

      <DemoBanner message="Navigation and facility maps running in Demo Mode. Demonstrating simulated Bengaluru transit & hospital locations." />

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospital, station, platform, or counter..."
            className="input-field w-full pl-10 pr-4 py-2.5 text-sm"
            aria-label="Search places and counters"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key as PlaceCategory | 'all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#176B67] text-white font-semibold'
                    : 'bg-white border text-gray-600 hover:bg-gray-100'
                }`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                {c.icon && <c.icon size={13} />}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Places List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlaces.length === 0 ? (
          <div className="md:col-span-2 card p-8 bg-white border text-center text-gray-400">
            <Compass size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No locations found matching your search query.</p>
          </div>
        ) : (
          filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="card p-5 bg-white border hover:shadow-md transition-shadow flex flex-col justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      {place.category === 'hospital' ? (
                        <Building2 size={16} className="text-[#176B67]" />
                      ) : place.category === 'railway' ? (
                        <Train size={16} className="text-[#176B67]" />
                      ) : (
                        <Bus size={16} className="text-[#176B67]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{place.name}</h3>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {place.distance} away
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleSpeak(
                        `${place.name}, located at ${place.address}. Key destinations include: ${place.destinations.join(', ')}`,
                        place.id
                      )
                    }
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 cursor-pointer"
                    title="Read place details aloud"
                    aria-label={`Read aloud details for ${place.name}`}
                  >
                    <Volume2 size={15} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                  <MapPin size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <span>{place.address}</span>
                </p>

                {/* Key Internal Destinations */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Internal Destinations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {place.destinations.map((dest) => (
                      <button
                        key={dest}
                        onClick={() => {
                          setActivePlace(place);
                          startNavigation(dest);
                        }}
                        className="text-xs bg-gray-100 hover:bg-teal-50 hover:text-teal-800 text-gray-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CornerDownRight size={11} />
                        <span>{dest}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                  <ShieldCheck size={14} />
                  <span>Wheelchair Accessible</span>
                </span>
                <button
                  onClick={() => {
                    setActivePlace(place);
                    startNavigation(place.destinations[0]);
                  }}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                >
                  <Navigation size={13} />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Navigation Modal */}
      <Modal
        isOpen={!!navigatingDestination}
        onClose={() => setNavigatingDestination(null)}
        title="Simulated Indoor Guidance"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
            <div className="flex items-center gap-2 mb-1">
              <Navigation size={18} className="text-[#176B67] animate-bounce" />
              <h4 className="font-bold text-sm text-teal-900">
                Heading to: {navigatingDestination}
              </h4>
            </div>
            <p className="text-xs text-teal-800">
              {activePlace?.name}
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50">
              <span className="w-5 h-5 rounded-full bg-[#176B67] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <p>Proceed straight along the blue tactile strip for 15 meters.</p>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50">
              <span className="w-5 h-5 rounded-full bg-[#176B67] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <p>Turn right at the Accessibility Information kiosk.</p>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-50">
              <span className="w-5 h-5 rounded-full bg-[#176B67] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <p>Your destination ({navigatingDestination}) will be on your left side.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setNavigatingDestination(null)}
              className="btn-primary text-xs py-2 px-4 cursor-pointer"
            >
              End Guidance
            </button>
          </div>
        </div>
      </Modal>

      <Disclaimer message="Indoor positioning and path cues are simulated for demo environments. In public stations, always refer to marked signage and staff assistance desks." />
    </div>
  );
}
