import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Exercise {
  _id?: string;
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  category?: string;
  force?: string;
  mechanic?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BodyPart {
  _id: string;
  id: number;
  name: string;
  createdAt: string;
}

export interface MusclesByBodyPart {
  bodyPartId: number;
  muscles: Array<{ name: string }>;
  totalMuscles: number;
}

export interface ExercisesByMuscle {
  muscle: string;
  level?: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalExercises: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  exercises: Exercise[];
}

export interface ExercisesResponse {
  data: Exercise[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ExercisesService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient) {}

  getExercises(
    page: number = 1,
    limit: number = 20,
    search?: string,
    level?: string,
    category?: string,
  ): Observable<ExercisesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (level) params = params.set('level', level);
    if (category) params = params.set('category', category);

    return this.http.get<ExercisesResponse>(this.apiUrl, { params });
  }

  getExerciseById(id: string): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  createExercise(
    exercise: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>,
  ): Observable<Exercise> {
    return this.http.post<Exercise>(this.apiUrl, exercise);
  }

  updateExercise(
    id: string,
    exercise: Partial<Exercise>,
  ): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, exercise);
  }

  deleteExercise(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getBodyParts(): Observable<BodyPart[]> {
    return this.http.get<BodyPart[]>(`${this.apiUrl}/body-parts`);
  }

  getMusclesByBodyPart(bodyPartId: number): Observable<MusclesByBodyPart> {
    return this.http.get<MusclesByBodyPart>(
      `${this.apiUrl}/body-parts/${bodyPartId}/muscles`,
    );
  }

  getExercisesByMuscle(
    muscle: string,
    page: number = 1,
    limit: number = 6,
    level?: string,
  ): Observable<ExercisesByMuscle> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (level) params = params.set('level', level);

    return this.http.get<ExercisesByMuscle>(
      `${this.apiUrl}/muscles/${muscle}`,
      { params },
    );
  }
}
