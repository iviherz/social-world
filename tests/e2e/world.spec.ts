import {test,expect} from '@playwright/test';import AxeBuilder from '@axe-core/playwright';
test('Mapa, estados de prueba, globo, móvil y accesibilidad',async({page})=>{
 await page.goto('/preview');await expect(page.locator('svg.world-map')).toBeVisible();await expect(page.getByRole('heading',{name:'El mundo, a tu manera.'})).toBeVisible();
 await page.getByLabel('Buscar país o territorio').fill('Argentina');await page.getByRole('button',{name:'Argentina +',exact:true}).click();
 await page.getByLabel('Lo visité',{exact:true}).check();await expect(page.getByLabel('Lo visité',{exact:true})).toBeChecked();
 await expect(page.getByText('Cambio de prueba. No se guardó en una cuenta.')).toBeVisible();
 await page.getByRole('button',{name:'Globo',exact:true}).click();await expect(page.getByLabel('Girar el globo')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);
 await page.reload();await expect(page.locator('svg.world-map')).toBeVisible();await expect(page.getByText('Los cambios de esta vista se pierden al recargar.')).toBeVisible();
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();});
 await page.screenshot({path:`test-results/preview-${test.info().project.name}.png`,fullPage:true});
});
test('Landing, 404 y endpoints cerrados sin configuración',async({page,request})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Los lugares pasan. Lo que te dejan, se queda.'})).toBeVisible();
 await page.goto('/una-pagina-inexistente');await expect(page.getByRole('heading',{name:'Este lugar no está en el mapa.'})).toBeVisible();
 const response=await request.post('/api/world',{data:{action:'delete_account',confirmation:'BORRAR MI CUENTA'}});expect(response.status()).toBe(403);
});
