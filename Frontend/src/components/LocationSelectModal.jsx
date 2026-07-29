import React, { useMemo, useState } from 'react';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LocationSelectModal({ open, onClose, onSelect, value, cities = [] }) {
    const [search, setSearch] = useState('');

    console.log('LocationSelectModal received cities:', cities);

    const filtered = useMemo(() => {
        if (!search.trim()) return cities;
        return cities.filter(city =>
            city.name && city.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, cities]);

    console.log('Filtered cities:', filtered);

    const handleSelect = (city) => {
        onSelect(city);
        onClose();
    };

    return (
        <ResponsiveDialog
            open={open}
            onClose={onClose}
            actions={null}
            centered
            maxWidth={780}
            destroyOnClose
            className="location-select-modal"
            heading={<div className="location-modal-header"><span className="font-semibold text-lg">Chá»n thÃ nh phá»‘</span></div>}
        >
            <div className="location-modal-toolbar">
                <Input
                    placeholder="TÃ¬m thÃ nh phá»‘ ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="location-search-input"
                />
            </div>
            <div className="location-grid">
                {filtered.map(city => {
                    const active = city.name === value;
                    return (
                        <Button
                            key={city.id}
                            variant={active ? 'default' : 'ghost'}
                            className={`province-item ${active ? 'active' : ''}`}
                            onClick={() => handleSelect(city)}
                        >
                            {city.name}
                        </Button>
                    );
                })}
                {!filtered.length && (
                    <div className="no-results">
                        <p className="text-gray-500">KhÃ´ng tÃ¬m tháº¥y thÃ nh phá»‘ phÃ¹ há»£p.</p>
                    </div>
                )}
            </div>
            <div className="location-modal-footer">
                <Button onClick={onClose} className="close-modal-btn">ÄÃ³ng</Button>
            </div>
        </ResponsiveDialog>
    );
}
