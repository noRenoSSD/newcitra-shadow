import React from 'react';

interface FormItemType {
    id_produk: number | string;
    nama_produk: string;
    qty_kirim: number;
    qty: number;
    kondisi_barang: 'Layak' | 'Perlu Perbaikan' | 'Rusak' | '';
    keterangan: string;
    isRetured: boolean;
}

interface ReturKonsinyasiDetailProps {
    item: FormItemType;
    index: number;
    kondisiBarangList: ('Layak' | 'Perlu Perbaikan' | 'Rusak')[];
    onItemRowChange: (index: number, field: keyof FormItemType, value: any) => void;
    onRemoveRow: (index: number) => void;
}

export const ReturKonsinyasiDetail: React.FC<ReturKonsinyasiDetailProps> = ({
    item,
    index,
    kondisiBarangList,
    onItemRowChange,
    onRemoveRow
}) => {
    if (!item.isRetured) return null;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 py-2.5 font-medium text-gray-900">{item.nama_produk}</td>
            <td className="px-4 py-2.5 text-gray-500 font-semibold">{item.qty_kirim}</td>
            <td className="px-4 py-2.5">
                <input 
                    type="number" 
                    min="0" 
                    max={item.qty_kirim} 
                    value={item.qty || ''} 
                    placeholder="0" 
                    onChange={(e) => onItemRowChange(index, 'qty', e.target.value)} 
                    className="w-20 border border-gray-300 rounded p-1 text-center outline-none focus:border-red-500 font-semibold" 
                />
            </td>
            <td className="px-4 py-2.5">
                <select 
                    value={item.kondisi_barang} 
                    disabled={item.qty === 0} 
                    onChange={(e) => onItemRowChange(index, 'kondisi_barang', e.target.value)} 
                    className={`w-full border border-gray-300 rounded p-1 text-xs bg-white ${item.qty === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Pilih Kondisi</option>
                    {kondisiBarangList.map((k) => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-2.5">
                <input 
                    type="text" 
                    placeholder="Alasan dikembalikan..." 
                    value={item.keterangan} 
                    disabled={item.qty === 0} 
                    onChange={(e) => onItemRowChange(index, 'keterangan', e.target.value)} 
                    className={`w-full border border-gray-300 rounded p-1 text-xs outline-none focus:border-red-500 ${item.qty === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                />
            </td>
            <td className="px-4 py-2.5 text-center">
                <button 
                    type="button" 
                    onClick={() => onRemoveRow(index)} 
                    className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                >
                    Tanpa Retur
                </button>
            </td>
        </tr>
    );
};