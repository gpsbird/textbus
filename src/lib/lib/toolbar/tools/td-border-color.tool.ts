import { Palette } from './utils/palette';
import { Toolkit } from '../toolkit/toolkit';
import { TableEditMatcher } from '../matcher/table-edit.matcher';
import { TdBorderColorCommander } from '../commands/td-border-color.commander';

export const tdBorderColorTool = Toolkit.makeDropdownTool({
  classes: ['textbus-icon-table-border'],
  tooltip: '表格边框颜色',
  menuFactory() {
    return new Palette('borderColor');
  },
  matcher: new TableEditMatcher(),
  commanderFactory() {
    return new TdBorderColorCommander();
  }
});
