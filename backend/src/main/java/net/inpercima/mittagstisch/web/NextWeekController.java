package net.inpercima.mittagstisch.web;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import net.inpercima.mittagstisch.model.Lunch;
import net.inpercima.mittagstisch.service.BistroImBic;
import net.inpercima.mittagstisch.service.GeschmackssacheLeipzig;
import net.inpercima.mittagstisch.service.PanLokal;

@RestController
public class NextWeekController {

    @GetMapping(value = "/next-week")
    public List<Lunch> listToday() throws IOException {
        final List<Lunch> lunch = new ArrayList<>();

        GeschmackssacheLeipzig geschmackssacheLeipizg = new GeschmackssacheLeipzig(7);
        geschmackssacheLeipizg.prepare();
        lunch.add(geschmackssacheLeipizg.parse());

        BistroImBic bistroImBic = new BistroImBic(7);
        bistroImBic.prepare();
        lunch.add(bistroImBic.parse());

        PanLokal panLokal = new PanLokal(7);
        panLokal.prepare();
        lunch.add(panLokal.parse());
        return lunch;
    }
}
