/**
 * Tamuu Bluetooth Printer Utility
 * Standard ESC/POS implementation for Thermal Printers (58mm / 80mm)
 * Uses Web Bluetooth API
 */

export interface PrinterDevice {
    device: BluetoothDevice;
    characteristic: BluetoothRemoteGATTCharacteristic;
}

class BluetoothPrinter {
    private device: BluetoothDevice | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

    // ESC/POS Commands
    private readonly COMMANDS = {
        RESET: new Uint8Array([0x1B, 0x40]),
        CENTER: new Uint8Array([0x1B, 0x61, 0x01]),
        LEFT: new Uint8Array([0x1B, 0x61, 0x00]),
        RIGHT: new Uint8Array([0x1B, 0x61, 0x02]),
        BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),
        BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),
        DOUBLE_SIZE: new Uint8Array([0x1D, 0x21, 0x11]), // Double width and height
        NORMAL_SIZE: new Uint8Array([0x1D, 0x21, 0x00]),
        FEED_AND_CUT: new Uint8Array([0x1D, 0x56, 0x41, 0x03]), // Feed 3 lines and cut
        LINE_FEED: new Uint8Array([0x0A]),
    };

    async connect(): Promise<boolean> {
        try {
            // Check if Bluetooth is supported
            if (!navigator.bluetooth) {
                throw new Error('Browser tidak mendukung Bluetooth');
            }

            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer service
                    { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] },
                    { namePrefix: 'Inner' },
                    { namePrefix: 'RPP' },
                    { namePrefix: 'MPT' },
                    { namePrefix: 'MTP' },
                    { namePrefix: 'Printer' },
                    { namePrefix: 'Thermal' }
                ],
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2']
            });

            const server = await this.device.gatt?.connect();
            if (!server) throw new Error('Gagal menghubungkan ke GATT server');

            // Find the printer characteristic
            const services = await server.getPrimaryServices();
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.characteristic = char;
                        break;
                    }
                }
                if (this.characteristic) break;
            }

            if (!this.characteristic) throw new Error('Karakteristik printer tidak ditemukan');

            return true;
        } catch (error) {
            console.error('[Printer] Connect error:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.device && this.device.gatt?.connected) {
            this.device.gatt.disconnect();
        }
        this.device = null;
        this.characteristic = null;
    }

    isConnected(): boolean {
        return !!(this.device && this.device.gatt?.connected && this.characteristic);
    }

    private async write(data: Uint8Array) {
        if (!this.characteristic) return;
        
        // Thermal printers usually have small buffers, split data into chunks
        const chunkSize = 20;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await this.characteristic.writeValue(chunk);
        }
    }

    private encode(text: string): Uint8Array {
        const encoder = new TextEncoder();
        return encoder.encode(text);
    }

    async printReceipt(guest: any, type: 'check-in' | 'check-out' = 'check-in') {
        if (!this.isConnected()) throw new Error('Printer tidak terhubung');

        const now = new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const data = [
            this.COMMANDS.RESET,
            this.COMMANDS.CENTER,
            this.COMMANDS.BOLD_ON,
            this.encode("TAMUU ID\n"),
            this.COMMANDS.BOLD_OFF,
            this.encode("Premium Digital Invitation\n"),
            this.encode("--------------------------------\n"),
            this.COMMANDS.LINE_FEED,
            this.encode(type === 'check-in' ? "GUEST CHECK-IN\n" : "GUEST CHECK-OUT\n"),
            this.COMMANDS.LINE_FEED,
            this.COMMANDS.DOUBLE_SIZE,
            this.encode(`${guest.name}\n`),
            this.COMMANDS.NORMAL_SIZE,
            this.COMMANDS.LINE_FEED,
            this.encode(`Tier: ${guest.tier?.toUpperCase() || 'REGULER'}\n`),
            this.encode(`Table: ${guest.table_number || guest.tableNumber || '-'}\n`),
            this.encode(`Guests: ${guest.guest_count || guest.guestCount || 1} Person\n`),
            this.COMMANDS.LINE_FEED,
            this.encode("--------------------------------\n"),
            this.encode(`${now}\n`),
            this.COMMANDS.LINE_FEED,
            this.encode("Terima kasih atas\n"),
            this.encode("kehadiran Anda.\n"),
            this.COMMANDS.LINE_FEED,
            this.COMMANDS.FEED_AND_CUT,
        ];

        // Combine all chunks into one Uint8Array
        const totalLength = data.reduce((acc, curr) => acc + curr.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of data) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        await this.write(combined);
    }
}

export const printer = new BluetoothPrinter();
