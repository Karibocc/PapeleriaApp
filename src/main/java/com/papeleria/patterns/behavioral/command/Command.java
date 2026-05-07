package com.papeleria.patterns.behavioral.command;

public interface Command {
    void execute();
    void undo();
}