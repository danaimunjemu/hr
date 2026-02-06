import {SubSink} from "subsink";

export function autoUnsubscribe() {
  return function (target: any) {
    const oldDestroyFunc = target.prototype.ngOnDestroy ?? function () {
    };

    target.prototype.ngOnDestroy = function () {
      oldDestroyFunc.call(this);
      // @ts-ignore
      const subscriptions = Object.values(this).filter((obj) => obj && obj.constructor === SubSink) as SubSink[];
      subscriptions.forEach((sub) => sub.unsubscribe());
    }
  }
}
