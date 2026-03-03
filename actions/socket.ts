'use client';

import { io } from 'socket.io-client';
import type { ManagerOptions, SocketOptions } from 'socket.io-client';

export const connect = (opts?: Partial<ManagerOptions & SocketOptions>) => io('http://127.0.0.1:8000', opts);

export const ws = connect({ transports: ['websocket'] });
export const events = {
	useSidebar: { permits: new Set(['admin', 'cooperator']), initVal: false },
	useEnv: { permits: new Set(['admin', 'cooperator']), initVal: null },
	useGroup: { permits: new Set(['admin', 'cooperator']), initVal: null },
	useSubGroup: { permits: new Set(['admin', 'cooperator']), initVal: null },
	useSelectedItem: { permits: new Set(['admin', 'cooperator']), initVal: null },
	useAddSubGroup: { permits: new Set(['admin']), initVal: null },
} as const;

// export const events = new Map([ c
// 	['sidebar', { userRole: 'cooperator', initVal: false }],
// 	['groups', { userRole: 'admin', initVal: [] }],
// 	['groupToAdd', { userRole: 'admin', initVal: null }],
// 	['openedGroups', { userRole: 'cooperator', initVal: [] }],
// ] as const);
