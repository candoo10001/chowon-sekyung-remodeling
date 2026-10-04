"""Furniture-scale sanity checks; these do not certify a building design."""
import json
import math
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PlanGeometryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        script = "global.window={};require('./plan-layout.js');process.stdout.write(JSON.stringify(window.APARTMENT_LAYOUT));"
        cls.plan = json.loads(subprocess.check_output(['node','-e',script],cwd=ROOT,encoding='utf-8'))

    def inside(self,x,z):
        p=self.plan['footprint']; hit=False
        for i,(a,b) in enumerate(p):
            c,d=p[i-1]
            if (b>z)!=(d>z) and x<(c-a)*(z-b)/(d-b)+a: hit=not hit
        return hit

    def bounds(self,f):
        w,d=(f['d'],f['w']) if f.get('angle') else (f['w'],f['d'])
        return f['x']-w/2,f['z']-d/2,f['x']+w/2,f['z']+d/2

    def test_all_furniture_inside_unit_and_disjoint(self):
        items=self.plan['furniture']+self.plan['fixtures']
        for i,f in enumerate(items):
            a,b,c,d=self.bounds(f)
            for x,z in ((a,b),(a,d),(c,b),(c,d)):
                self.assertTrue(self.inside(x,z),f)
            for other in items[i+1:]:
                e,g,h,j=self.bounds(other)
                self.assertFalse(min(c,h)-max(a,e)>.01 and min(d,j)-max(b,g)>.01,(f,other))

    def test_door_sweeps_clear_of_main_furniture(self):
        for x,z,axis,side in self.plan['doors']:
            for f in self.plan['furniture']+self.plan['fixtures']:
                a,b,c,d=self.bounds(f)
                for step in range(19):
                    theta=step*math.pi/36
                    for ring in range(1,18):
                        r=ring*.047
                        if axis=='h': px,pz=x-.425+r*math.cos(theta),z+side*r*math.sin(theta)
                        else: px,pz=x+side*r*math.sin(theta),z-.425+r*math.cos(theta)
                        self.assertFalse(a+.01<px<c-.01 and b+.01<pz<d-.01,((x,z),f))

    def test_camera_points_are_in_walkable_space(self):
        for room in self.plan['rooms'].values():
            x,_,z=room['camera']
            self.assertTrue(self.inside(x,z),room['name'])
            for f in self.plan['furniture']:
                a,b,c,d=self.bounds(f)
                self.assertFalse(a<x<c and b<z<d,(room['name'],f))

    def test_kitchen_and_main_route_clearances(self):
        table=next(f for f in self.plan['furniture'] if f['type']=='dining')
        counter=next(f for f in self.plan['furniture'] if f['type']=='counter')
        a,b,c,d=self.bounds(table);e,g,h,j=self.bounds(counter)
        self.assertGreaterEqual(b-j,1.0)  # clear worktop-to-table gap, no chair here
        self.assertGreaterEqual(-.15-.065-c,1.0)  # main route beside table


if __name__=='__main__': unittest.main()
