export default class EventUtil {
    static targetIsDescendant(event, parent) {
        let node = event.target;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }
};
