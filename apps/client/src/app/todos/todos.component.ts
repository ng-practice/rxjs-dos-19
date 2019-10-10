import { Component, OnInit } from '@angular/core';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { Todo } from './models';
import { TodoService } from './todo.service';
import {
  first,
  map,
  mapTo,
  skip,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';

@Component({
  selector: 'dos-todos',
  templateUrl: './todos.component.html'
})
export class TodosComponent implements OnInit {
  todos$: Observable<Todo[]>;
  todosSource$ = this.todosService.loadFrequently();
  todosInitial$: Observable<Todo[]>;
  todosMostRecent$: Observable<Todo[]>;

  filter$$ = new Subject<string>();
  update$$ = new Subject();
  refresh$: Observable<string>;
  show$: Observable<boolean>;
  hide$: Observable<boolean>;
  showReload$: Observable<boolean>;

  constructor(private todosService: TodoService) {}

  ngOnInit(): void {
    this.todosInitial$ = this.todosSource$.pipe(first());

    this.refresh$ = combineLatest([
      this.update$$.pipe(
        startWith(''),
        mapTo('')
      ),
      this.filter$$
    ]).pipe(map(([button, filter]) => (filter ? filter : button)));

    this.refresh$.subscribe(console.log);
    this.todosMostRecent$ = this.refresh$.pipe(
      withLatestFrom(this.todosSource$),
      map(([filter, todos]) =>
        filter.length > 1
          ? todos.filter(todo => todo.text.includes(filter))
          : todos
      )
    );

    this.todos$ = merge(this.todosInitial$, this.todosMostRecent$);

    this.show$ = this.todosSource$.pipe(
      skip(1),
      mapTo(true)
    );
    this.hide$ = this.update$$.pipe(mapTo(false));
    this.showReload$ = merge(this.show$, this.hide$);
  }

  completeOrIncompleteTodo(todoForUpdate: Todo) {
    /*
     * Note in order to keep the code clean for the workshop we did not
     * handle the following subscription.
     * Normally you want to unsubscribe.
     *
     * We just want to focus you on RxJS.
     */
    this.todosService.completeOrIncomplete(todoForUpdate).subscribe();
  }
}
