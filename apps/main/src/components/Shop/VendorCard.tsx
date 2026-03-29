"use client";

import React from 'react';
import { MapPin, Star, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/Card"

interface VendorCardProps {
    vendor: any;
}

export const VendorCard = ({ vendor }: VendorCardProps) => {
    const router = useRouter();

    return (
        <Card 
            onClick={() => router.push(`/shop/${vendor.slug || vendor.id}`)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-amber-200 transition-all cursor-pointer shadow-sm"
        >
            <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-amber-50 transition-colors">
                        <Store className="w-6 h-6 text-slate-300 group-hover:text-[#FFBF00] transition-colors" />
                    </div>
                    <div>
                        <h3 className="font-black text-[#0A1128] leading-tight uppercase tracking-tight">{vendor.store_name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vendor.kota || 'Nasional'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-[#FFBF00] fill-[#FFBF00]" />
                        <span className="text-sm font-black text-[#0A1128]">{vendor.rating || '0.0'}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">({vendor.review_count || 0} reviews)</span>
                </div>
            </CardContent>
        </Card>
    );
};
