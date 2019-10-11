import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, timer } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  retryWhen,
  share,
  switchMap,
  tap
} from 'rxjs/operators';
import { Toolbelt } from './internals';
import { Todo, TodoApi } from './models';
import { TodoSettings } from './todo-settings.service';

const todosUrl = 'http://localhost:3333/api';

@Injectable()
export class TodoService {
  constructor(
    private http: HttpClient,
    private toolbelt: Toolbelt,
    private settings: TodoSettings
  ) {}

  loadFrequently() {
    // TODO: Introduce error handled, configured, recurring, all-mighty stream
    return this.settings.settings$.pipe(
      switchMap(settings =>
        settings.isPollingEnabled
          ? timer(0, settings.pollingInterval).pipe(
              exhaustMap(() => this.query().pipe(catchError(() => EMPTY))),
              retryWhen(() => timer(1000)),
              tap({ error: () => this.toolbelt.offerHardReload() })
            )
          : this.query()
      ),
      share()
    );
  }

  private query(): Observable<Todo[]> {
    return this.http
      .get<TodoApi[]>(`${todosUrl}`)
      .pipe(map(todos => todos.map(todo => this.toolbelt.deserialize(todo))));
  }

  create(todo: Todo): Observable<TodoApi> {
    return this.http.post<TodoApi>(todosUrl, todo);
  }

  remove(todoForRemoval: TodoApi): Observable<Todo> {
    return this.http
      .delete<TodoApi>(`${todosUrl}/${todoForRemoval.id}`)
      .pipe(map(todo => this.toolbelt.deserialize(todo)));
  }

  completeOrIncomplete(todoForUpdate: Todo): Observable<Todo> {
    const updatedTodo = this.toggleTodoState(todoForUpdate);
    return this.http
      .put<TodoApi>(
        `${todosUrl}/${todoForUpdate.id}`,
        this.toolbelt.serialize(updatedTodo)
      )
      .pipe(map(todo => this.toolbelt.deserialize(todo)));
  }

  private toggleTodoState(todoForUpdate: Todo): any {
    return {
      ...todoForUpdate,
      isDone: todoForUpdate.isDone ? false : true
    };
  }
}
