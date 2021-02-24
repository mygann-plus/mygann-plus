/* eslint-disable max-len */
import registerModule from '~/core/module';
import { waitForLoad, createElement } from '~/utils/dom';

const domQuery = () => document.querySelector('#accordionSchedules') as HTMLElement;

function generateBlock(start: string, end: string): HTMLElement {
  return (
    <tr data-index="0">
      <td data-heading="Time">                                            {start}   - {end}                                     </td>
      <td data-heading="Block">                                            Z&apos;man Kodesh                                    </td>
      <td data-heading="Activity">
        <h4>                                                <a href="https://xkcd.com/404">Mini Z&apos;man Kodesh!</a>                                            </h4>
      </td>
      <td data-heading="Contact">                                    יהוה                </td>
      <td data-heading="Details" className="this-week-directions">                                                        </td>
      <td data-heading="Attendance">    <span><span>--</span></span>    </td>
    </tr>
  );
}

async function zmanKodeshStuff() {
  console.log('function started');
  const sched = await waitForLoad(domQuery);
  // await waitForLoad(() => sched.querySelector('tr'));
  console.log(sched.children);
  const blocks = Array.from(sched.children).filter(block => {
    let blockName = (block.querySelector('td[data-heading="Block"]') as HTMLElement).innerText;
    return !(blockName.includes('Kodesh') || blockName.includes('Mincha') || blockName.includes('Wellness'));
  }) as HTMLElement[];
  // eslint-disable-next-line radix
  let times = blocks.map(block => (block.querySelector('td[data-heading="Time"]') as HTMLElement).innerText.split(' ').map(t => (t.includes(':') ? t.replace(/\d$/, s => (parseInt(s) + 1).toString()) : t)));
  blocks.pop();
  for (let i = 0; i < blocks.length; i++) {
    // console.log('doing things');
    let newBlock = generateBlock(`${times[i][3]} ${times[i][4]}`, `${times[i + 1][0]} ${times[i + 1][1]}`);
    // blocks[i].after(newBlock);
    let newSched = await waitForLoad(domQuery);
    // console.log(newSched, document.body.contains(sched), newBlock);
    newSched.insertBefore(newBlock, blocks[i + 1]);
    // console.log(document.body.contains(newBlock));
  }

  // (await waitForLoad(domQuery)).appendChild(<h1>HIIIIII</h1>);

}

async function zmanKodeshMain() {
  zmanKodeshStuff();
  const obs = new MutationObserver(zmanKodeshStuff);
  obs.observe(document.body, { attributes: true, childList: true, subtree: true });
}

export default registerModule('{549d0578-c9ba-4f70-a0ad-41705b32cc9f}', {
  name: 'Mini Z\'man Kodesh',
  main: zmanKodeshMain,
});