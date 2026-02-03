import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toggleAnimation } from '../shared/animations';

// Icons
import { IconPencilComponent } from '../shared/icon/icon-pencil';
import { IconTrashLinesComponent } from '../shared/icon/icon-trash-lines';
import { IconPlusComponent } from '../shared/icon/icon-plus';
import { IconCircleCheckComponent } from '../shared/icon/icon-circle-check';

@Component({
    templateUrl: './firewall.html',
    imports: [
        CommonModule,
        FormsModule,
        IconPencilComponent,
        IconTrashLinesComponent,
        IconPlusComponent,
        IconCircleCheckComponent,
    ],
    animations: [toggleAnimation],
})
export class FirewallComponent implements OnInit {
    search = '';
    showModal = false;
    modalMode: 'create' | 'edit' = 'create';
    isLoading = false;

    // Mock data for firewall rules (PBX/Asterisk relevant)
    rules = [
        { id: 1, name: 'SIP Signaling', protocol: 'UDP', port: '5060', source: 'Any', action: 'ACCEPT', priority: 10, is_active: true },
        { id: 2, name: 'SIP TLS', protocol: 'TCP', port: '5061', source: 'Any', action: 'ACCEPT', priority: 20, is_active: true },
        { id: 3, name: 'RTP Media', protocol: 'UDP', port: '10000-20000', source: 'Any', action: 'ACCEPT', priority: 30, is_active: true },
        { id: 4, name: 'IAX2 Trunk', protocol: 'UDP', port: '4569', source: '192.168.1.0/24', action: 'ACCEPT', priority: 40, is_active: true },
        { id: 5, name: 'AMI Manager', protocol: 'TCP', port: '5038', source: '10.0.0.0/8', action: 'ACCEPT', priority: 50, is_active: true },
        { id: 6, name: 'SSH Admin', protocol: 'TCP', port: '22', source: '10.0.0.0/8', action: 'ACCEPT', priority: 100, is_active: true },
        { id: 7, name: 'Block External SIP', protocol: 'UDP', port: '5060', source: '0.0.0.0/0', action: 'DROP', priority: 999, is_active: false },
    ];

    formData: any = {
        name: '',
        protocol: 'UDP',
        port: '',
        source: 'Any',
        action: 'ACCEPT',
        priority: 100,
        is_active: true,
    };

    protocols = ['TCP', 'UDP', 'ICMP', 'ALL'];
    actions = ['ACCEPT', 'DROP', 'REJECT'];

    constructor() { }

    ngOnInit(): void { }

    get filteredRules() {
        if (!this.search) return this.rules.sort((a, b) => a.priority - b.priority);
        const s = this.search.toLowerCase();
        return this.rules
            .filter(r =>
                r.name.toLowerCase().includes(s) ||
                r.protocol.toLowerCase().includes(s) ||
                r.port.toLowerCase().includes(s) ||
                r.source.toLowerCase().includes(s)
            )
            .sort((a, b) => a.priority - b.priority);
    }

    openCreateModal() {
        this.modalMode = 'create';
        this.formData = { name: '', protocol: 'UDP', port: '', source: 'Any', action: 'ACCEPT', priority: 100, is_active: true };
        this.showModal = true;
    }

    openEditModal(rule: any) {
        this.modalMode = 'edit';
        this.formData = { ...rule };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleSubmit() {
        if (this.modalMode === 'create') {
            this.rules.push({ ...this.formData, id: Date.now() });
        } else {
            const idx = this.rules.findIndex(r => r.id === this.formData.id);
            if (idx !== -1) this.rules[idx] = { ...this.formData };
        }
        this.closeModal();
    }

    deleteRule(id: number) {
        if (confirm('Are you sure you want to delete this firewall rule?')) {
            this.rules = this.rules.filter(r => r.id !== id);
        }
    }

    getActionClass(action: string): string {
        switch (action) {
            case 'ACCEPT': return 'badge bg-success';
            case 'DROP': return 'badge bg-danger';
            case 'REJECT': return 'badge bg-warning';
            default: return 'badge bg-dark';
        }
    }
}
