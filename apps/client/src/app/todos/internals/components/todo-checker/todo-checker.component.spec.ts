import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoCheckerComponent } from './todo-checker.component';

describe('TodoCheckComponent', () => {
  let component: TodoCheckerComponent;
  let fixture: ComponentFixture<TodoCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TodoCheckerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
