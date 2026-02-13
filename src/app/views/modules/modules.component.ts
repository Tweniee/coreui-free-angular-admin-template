import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ModalModule,
  TableModule,
  BadgeModule,
  DropdownModule,
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ModulesService, Module } from '../../services/modules.service';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    TableModule,
    ButtonModule,
    ModalModule,
    FormModule,
    IconModule,
    BadgeModule,
    DropdownModule,
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
})
export class ModulesComponent implements OnInit {
  modules = signal<Module[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentModule: Partial<Module> = {
    name: '',
    code: '',
    description: '',
    order: 1,
    isActive: true,
  };
  moduleToDelete: Module | null = null;

  constructor(private modulesService: ModulesService) {}

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.loading.set(true);
    this.error.set('');

    this.modulesService.getAllModules().subscribe({
      next: (modules) => {
        // Sort by order
        const sortedModules = modules.sort(
          (a, b) => (a.order || 0) - (b.order || 0),
        );
        this.modules.set(sortedModules);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load modules');
      },
    });
  }

  get filteredModules() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.modules();
    return this.modules().filter(
      (module) =>
        module.name.toLowerCase().includes(term) ||
        module.code.toLowerCase().includes(term) ||
        (module.description && module.description.toLowerCase().includes(term)),
    );
  }

  formatModuleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  openCreateModal() {
    this.isEditMode.set(false);
    const maxOrder = Math.max(...this.modules().map((m) => m.order || 0), 0);
    this.currentModule = {
      name: '',
      code: '',
      description: '',
      order: maxOrder + 1,
      isActive: true,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(module: Module) {
    this.isEditMode.set(true);
    this.currentModule = { ...module };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(module: Module) {
    this.moduleToDelete = module;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  saveModule() {
    this.error.set('');
    this.success.set('');

    if (!this.currentModule.name || !this.currentModule.code) {
      this.error.set('Please enter module name and code');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentModule._id) {
      // Update existing module
      const { _id, createdAt, updatedAt, ...updateData } = this.currentModule;
      this.modulesService.updateModule(_id, updateData).subscribe({
        next: (updatedModule) => {
          this.modules.update((modules) =>
            modules
              .map((m) => (m._id === updatedModule._id ? updatedModule : m))
              .sort((a, b) => (a.order || 0) - (b.order || 0)),
          );
          this.loading.set(false);
          this.success.set('Module updated successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to update module');
        },
      });
    } else {
      // Create new module
      const { createdAt, updatedAt, ...createData } = this.currentModule;
      this.modulesService.createModule(createData).subscribe({
        next: (newModule) => {
          this.modules.update((modules) =>
            [...modules, newModule].sort(
              (a, b) => (a.order || 0) - (b.order || 0),
            ),
          );
          this.loading.set(false);
          this.success.set('Module created successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create module');
        },
      });
    }
  }

  deleteModule() {
    if (!this.moduleToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.modulesService.deleteModule(this.moduleToDelete._id).subscribe({
      next: (deletedModule) => {
        // Update the module in the list (soft delete sets isActive to false)
        this.modules.update((modules) =>
          modules.map((m) => (m._id === deletedModule._id ? deletedModule : m)),
        );
        this.loading.set(false);
        this.success.set('Module deleted successfully');
        setTimeout(() => this.closeDeleteModal(), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete module');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentModule = {
      name: '',
      code: '',
      description: '',
      order: 1,
      isActive: true,
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.moduleToDelete = null;
    this.error.set('');
    this.success.set('');
  }
}
