package net.inpercima.mittagstisch.service;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.gargoylesoftware.htmlunit.html.HtmlPage;

import net.inpercima.mittagstisch.model.Lunch;
import net.inpercima.mittagstisch.model.State;

public class MittagstischKantine3 extends Mittagstisch {

    public MittagstischKantine3(final int days) {
        this.setLunchSelector("main section div div p");
        this.setUrl("http://www.tapetenwerk.de/aktuelles/speiseplan-kantine/");
        this.setWeekSelector("main section div div h1");
        this.setName("Kantine 3 (im Tapetenwerk)");
        this.setDaily(true);
        this.setDays(days);
    }

    /**
     * Parses and returns the output for the lunch in "Kantine 3 (im Tapetenwerk)".
     *
     * @param state
     * @throws IOException
     */
    public Lunch parse(final State state) throws IOException {
        final HtmlPage htmlPage = MittagstischUtil.getHtmlPage(getUrl());
        String food = htmlPage.querySelectorAll(getLunchSelector()).stream()
                .filter(p -> MittagstischUtil.filterNodes(p, getDays(), "TÄGLICH", true))
                .map(p -> update(p.getTextContent())).collect(Collectors.joining("<br>"));
        // Replacement necessary because name of day can be in the paragraph
        return buildLunch(state, food.replace(MittagstischUtil.getDay(true, getDays()), ""));
    }

    /**
     * Updates the content if there is no space between food and price.
     *
     * @param content The text in paragraph.
     * @return
     */
    public static String update(final String content) {
        String result = content;
        final String[] pattern = { "\\d+,-", "\\d+,\\d+" };
        for (int i = 0; i < pattern.length; i++) {
            final Matcher matcher = Pattern.compile(pattern[i]).matcher(content);
            if (matcher.find()) {
                result = content.substring(0, matcher.start()).concat(" ")
                        .concat(content.substring(matcher.start(), matcher.end()));
                break;
            }
        }
        return result;
    }

}
