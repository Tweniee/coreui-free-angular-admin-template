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
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  ExercisesService,
  Exercise,
  BodyPart,
} from '../../services/exercises.service';

@Component({
  selector: 'app-exercises',
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
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit {
  exercises = signal<Exercise[]>([]);
  bodyParts = signal<BodyPart[]>([]);

  searchTerm = signal('');
  levelFilter = signal('');
  categoryFilter = signal('');
  bodyPartFilter = signal<number | undefined>(undefined);

  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  detailsModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentPage = signal(1);
  pageSize = signal(20);
  totalExercises = signal(0);
  totalPages = signal(0);

  currentExercise: Partial<Exercise> = {
    id: '',
    name: '',
    level: 'beginner',
    equipment: '',
    primaryMuscles: [],
    secondaryMuscles: [],
    instructions: [],
    category: '',
    bodyPartIds: [],
  };

  primaryMusclesInput = '';
  secondaryMusclesInput = '';
  instructionsInput = '';
  selectedFiles: File[] = [];
  selectedBodyPartIds: number[] = [];

  exerciseToDelete: Exercise | null = null;
  selectedExercise: Exercise | null = null;

  levels: Array<'beginner' | 'intermediate' | 'expert'> = [
    'beginner',
    'intermediate',
    'expert',
  ];
  categories = [
    'olympic weightlifting',
    'stretching',
    'powerlifting',
    'strength',
    'cardio',
    'strongman',
    'plyometrics',
  ];

  readonly imageBaseUrl =
    'https://raw.githubusercontent.com/Tweniee/free-exercise-db/main/exercises/';

  Math = Math;

  constructor(private exercisesService: ExercisesService) {}

  ngOnInit() {
    this.loadExercises();
    this.loadBodyParts();
  }

  loadBodyParts() {
    this.exercisesService.getBodyParts().subscribe({
      next: (bodyParts) => {
        this.bodyParts.set(bodyParts);
      },
      error: (err) => {
        console.error('Failed to load body parts:', err);
      },
    });
  }

  loadExercises() {
    this.loading.set(true);
    this.error.set('');

    this.exercisesService
      .getExercises(
        this.currentPage(),
        this.pageSize(),
        this.searchTerm(),
        this.levelFilter(),
        this.categoryFilter(),
        this.bodyPartFilter(),
      )
      .subscribe({
        next: (response) => {
          this.exercises.set(response.data);
          this.totalExercises.set(response.pagination.total);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to load exercises');
        },
      });
  }

  applySearch() {
    this.currentPage.set(1);
    this.loadExercises();
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadExercises();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.levelFilter.set('');
    this.categoryFilter.set('');
    this.bodyPartFilter.set(undefined);
    this.currentPage.set(1);
    this.loadExercises();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentExercise = {
      id: '',
      name: '',
      level: 'beginner',
      equipment: '',
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [],
      category: '',
      bodyPartIds: [],
    };
    this.primaryMusclesInput = '';
    this.secondaryMusclesInput = '';
    this.instructionsInput = '';
    this.selectedFiles = [];
    this.selectedBodyPartIds = [];
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  openEditModal(exercise: Exercise) {
    this.isEditMode.set(true);
    this.currentExercise = { ...exercise };
    this.primaryMusclesInput = exercise.primaryMuscles?.join(', ') || '';
    this.secondaryMusclesInput = exercise.secondaryMuscles?.join(', ') || '';
    this.instructionsInput = exercise.instructions?.join('\n') || '';
    this.selectedBodyPartIds = exercise.bodyPartIds || [];
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(exercise: Exercise) {
    this.exerciseToDelete = exercise;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  openDetailsModal(exercise: Exercise) {
    this.loading.set(true);
    this.exercisesService.getExerciseById(exercise._id!).subscribe({
      next: (data) => {
        this.selectedExercise = data;
        this.loading.set(false);
        this.detailsModalVisible.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load exercise details');
      },
    });
  }

  toggleBodyPart(bodyPartId: number) {
    const index = this.selectedBodyPartIds.indexOf(bodyPartId);
    if (index > -1) {
      this.selectedBodyPartIds.splice(index, 1);
    } else {
      this.selectedBodyPartIds.push(bodyPartId);
    }
  }

  isBodyPartSelected(bodyPartId: number): boolean {
    return this.selectedBodyPartIds.includes(bodyPartId);
  }

  saveExercise() {
    this.error.set('');
    this.success.set('');

    if (!this.currentExercise.id || !this.currentExercise.name) {
      this.error.set('Please fill in ID and Name fields');
      return;
    }

    // Parse comma-separated muscles
    this.currentExercise.primaryMuscles = this.primaryMusclesInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    this.currentExercise.secondaryMuscles = this.secondaryMusclesInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // Parse line-separated instructions
    this.currentExercise.instructions = this.instructionsInput
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    // Set body part IDs
    this.currentExercise.bodyPartIds = this.selectedBodyPartIds;

    this.loading.set(true);

    if (this.isEditMode() && this.currentExercise._id) {
      this.exercisesService
        .updateExercise(this.currentExercise._id, this.currentExercise)
        .subscribe({
          next: () => {
            this.loadExercises();
            this.loading.set(false);
            this.success.set('Exercise updated successfully');
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to update exercise');
          },
        });
    } else {
      const createObservable =
        this.selectedFiles.length > 0
          ? this.exercisesService.createExerciseWithFiles(
              this.currentExercise as Omit<
                Exercise,
                '_id' | 'createdAt' | 'updatedAt'
              >,
              this.selectedFiles,
            )
          : this.exercisesService.createExercise(
              this.currentExercise as Omit<
                Exercise,
                '_id' | 'createdAt' | 'updatedAt'
              >,
            );

      createObservable.subscribe({
        next: () => {
          this.loadExercises();
          this.loading.set(false);
          this.success.set('Exercise created successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create exercise');
        },
      });
    }
  }

  deleteExercise() {
    if (!this.exerciseToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.exercisesService.deleteExercise(this.exerciseToDelete._id).subscribe({
      next: () => {
        this.exercises.update((exercises) =>
          exercises.filter((e) => e._id !== this.exerciseToDelete!._id),
        );
        this.loading.set(false);
        this.success.set('Exercise deleted successfully');
        setTimeout(() => this.closeDeleteModal(), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete exercise');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentExercise = {
      id: '',
      name: '',
      level: 'beginner',
      equipment: '',
      primaryMuscles: [],
      secondaryMuscles: [],
      instructions: [],
      category: '',
      bodyPartIds: [],
    };
    this.primaryMusclesInput = '';
    this.secondaryMusclesInput = '';
    this.instructionsInput = '';
    this.selectedFiles = [];
    this.selectedBodyPartIds = [];
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.exerciseToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  closeDetailsModal() {
    this.detailsModalVisible.set(false);
    this.selectedExercise = null;
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadExercises();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadExercises();
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'expert':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getImageUrl(imagePath: string): string {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the base URL
    return this.imageBaseUrl + imagePath;
  }
}
