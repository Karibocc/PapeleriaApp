package com.papeleria.patterns.behavioral.command;

import org.springframework.stereotype.Component;
import java.util.Stack;

@Component
public class CommandInvoker {
    private Stack<Command> history = new Stack<>();

    public void executeCommand(Command command) {
        command.execute();
        history.push(command);
    }

    public void undoLast() {
        if (!history.isEmpty()) {
            Command last = history.pop();
            last.undo();
        }
    }
}