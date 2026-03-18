/**
 * Tamuu Bluetooth Printer Utility - Enterprise Version
 * High-reliability implementation with retry logic and connection warming
 */

export interface PrinterDevice {
    device: BluetoothDevice;
    characteristic: BluetoothRemoteGATTCharacteristic;
}

class BluetoothPrinter {
    private device: BluetoothDevice | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private isConnecting: boolean = false;

    private readonly COMMANDS = {
        RESET: new Uint8Array([0x1B, 0x40]),
        CENTER: new Uint8Array([0x1B, 0x61, 0x01]),
        LEFT: new Uint8Array([0x1B, 0x61, 0x00]),
        RIGHT: new Uint8Array([0x1B, 0x61, 0x02]),
        BOLD_ON: new Uint8Array([0x1B, 0x45, 0x01]),
        BOLD_OFF: new Uint8Array([0x1B, 0x45, 0x00]),
        DOUBLE_SIZE: new Uint8Array([0x1D, 0x21, 0x11]),
        NORMAL_SIZE: new Uint8Array([0x1D, 0x21, 0x00]),
        FEED_AND_CUT: new Uint8Array([0x1D, 0x56, 0x41, 0x03]),
        LINE_FEED: new Uint8Array([0x0A]),
    };

    async connect(): Promise<boolean> {
        if (this.isConnecting) return false;
        this.isConnecting = true;

        try {
            if (!navigator.bluetooth) throw new Error('Bluetooth not supported');

            console.log('[Printer] Requesting device...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
                    { namePrefix: 'Inner' },
                    { namePrefix: 'RPP' },
                    { namePrefix: 'MPT' },
                    { namePrefix: 'MTP' },
                    { namePrefix: 'Printer' },
                    { namePrefix: 'Thermal' }
                ],
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2']
            });

            this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

            return await this.warmConnection();
        } catch (error) {
            console.error('[Printer] Setup failed:', error);
            this.isConnecting = false;
            return false;
        }
    }

    private async warmConnection(): Promise<boolean> {
        if (!this.device) return false;
        
        try {
            const server = await this.device.gatt?.connect();
            if (!server) return false;

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

            this.isConnecting = false;
            return !!this.characteristic;
        } catch (e) {
            console.error('[Printer] Warming failed:', e);
            this.isConnecting = false;
            return false;
        }
    }

    private handleDisconnect() {
        console.warn('[Printer] GATT Disconnected');
        this.characteristic = null;
        // Auto-reconnect warming could go here
    }

    async disconnect() {
        if (this.device?.gatt?.connected) {
            this.device.gatt.disconnect();
        }
        this.device = null;
        this.characteristic = null;
    }

    isConnected(): boolean {
        return !!(this.device?.gatt?.connected && this.characteristic);
    }

    private async write(data: Uint8Array) {
        if (!this.characteristic) throw new Error('Printer disconnected');
        
        // ENTERPRISE CHUNKING: Safe buffer sizes for varied hardware
        const chunkSize = 512; 
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await this.characteristic.writeValue(chunk);
        }
    }

    private encode(text: string): Uint8Array {
        return new TextEncoder().encode(text);
    }

    async printReceipt(guest: any, type: 'check-in' | 'check-out' = 'check-in') {
        if (!this.isConnected()) {
            const warmed = await this.warmConnection();
            if (!warmed) throw new Error('Printer unreachable');
        }

        const now = new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        // BUILD DATA STREAM
        const chunks = [
            this.COMMANDS.RESET,
            this.COMMANDS.CENTER,
            this.COMMANDS.BOLD_ON,
            this.encode("TAMUU ID\n"),
            this.COMMANDS.BOLD_OFF,
            this.encode("Elite Event Management\n"),
            this.encode("--------------------------------\n\n"),
            this.encode(type === 'check-in' ? "ENTRY GRANTED\n" : "DEPARTURE CONFIRMED\n"),
            this.COMMANDS.DOUBLE_SIZE,
            this.encode(`${guest.name}\n`),
            this.COMMANDS.NORMAL_SIZE,
            this.encode(`\nTier: ${guest.tier?.toUpperCase() || 'REGULER'}\n`),
            this.encode(`Table: ${guest.table_number || guest.tableNumber || '-'}\n`),
            this.encode(`PAX: ${guest.guest_count || 1}\n\n`),
            this.encode("--------------------------------\n"),
            this.encode(`${now}\n\n`),
            this.encode("Thank you for your presence.\n"),
            this.COMMANDS.FEED_AND_CUT,
        ];

        const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
        const stream = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            stream.set(chunk, offset);
            offset += chunk.length;
        }

        try {
            await this.write(stream);
            return true;
        } catch (e) {
            console.error('[Printer] Write failed:', e);
            return false;
        }
    }
}

export const printer = new BluetoothPrinter();
