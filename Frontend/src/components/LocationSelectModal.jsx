import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
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
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={780}
            destroyOnClose
            className="location-select-modal"
            title={<div className="location-modal-header"><span className="font-semibold text-lg">Chọn thành phố</span></div>}
        >
            <div className="location-modal-toolbar">
                <Input
                    placeholder="Tìm thành phố ..."
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
                        <p className="text-gray-500">Không tìm thấy thành phố phù hợp.</p>
                    </div>
                )}
            </div>
            <div className="location-modal-footer">
                <Button onClick={onClose} className="close-modal-btn">Đóng</Button>
            </div>
        </Modal>
    );
}
