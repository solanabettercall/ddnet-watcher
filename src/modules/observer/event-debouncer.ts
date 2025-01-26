import { Subject, throttleTime } from 'rxjs';

export class EventDebouncer {
  private subjects: Map<string, Subject<any>> = new Map();

  constructor(private debounceTimeMs = 300) {}

  /**
   * Добавить событие для обработки с дебаунсом.
   * @param key Уникальный ключ события
   * @param data Данные события
   * @param callback Функция, вызываемая после дебаунса
   */
  emit<T>(key: string, data: T, callback: (data: T) => void): void {
    if (!this.subjects.has(key)) {
      const subject = new Subject<T>();
      this.subjects.set(key, subject);

      subject
        .pipe(
          throttleTime(this.debounceTimeMs, null, {
            leading: true,
            trailing: false,
          }),
        )
        .subscribe(callback);
    }

    this.subjects.get(key)!.next(data);
  }
}
