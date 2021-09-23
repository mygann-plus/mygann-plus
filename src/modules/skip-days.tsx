import registerModule from '~/core/module';
import { createElement } from '~/utils/dom';

function jumpToDay(date: Date) {
  const script = (
    <script onLoad={this.remove()}>
      const sched = p3.module(`schedule`);
      sched.Data.dayViewDate = {date};
      ched.Us.fetchScheduleData();
    </script>
  );
}

async function skipEmptyMain() {

}

export default registerModule('{42efc8ef-9de0-4eef-8e74-ba18f568b8a3}', {
  name: 'skippy',
  main: skipEmptyMain,
});
